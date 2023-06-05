import TradeRepublicMessageParser from "./TradeRepublicMessageParser";
import { v4 as uuid } from "uuid";
import { StorageUtil } from "../storage/StorageUtil";

type Result = {
  taxExemption: {
    applied: number;
    used: number;
    remaining: number;
  };
};

export default class TradeRepublicTaxInformationProcessor implements Processor.MessageProcessor<Result> {
  private storageFactory: Storage.StorageFactory;

  constructor(storageFactory: Storage.StorageFactory) {
    this.storageFactory = storageFactory;
  }

  match(message: RawEntity.Message, account: Extension.Account): boolean {
    return account.source.type == "trade-republic" && message.type == "tax-information";
  }

  async store(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<Result>,
    deduplicateResult: Processor.DeduplicateResult<Result>,
    account: Extension.Account
  ): Promise<RawEntity.MessageStatus> {
    if (!processResult.processed) {
      return "unprocessed";
    }
    const repository = this.storageFactory.makeDailyTaxInformationRepository(account);
    const exist = await repository.findCurrent(message.timestamp);
    if (exist) {
      exist.taxExemption = processResult.data.taxExemption;
      exist.timestamp = message.timestamp;
      await repository.save(exist);
    } else {
      const data: ProcessedEntity.DailyTaxInformation = {
        id: uuid(),
        taxExemption: processResult.data.taxExemption,
        month: StorageUtil.getMonth(message.timestamp),
        date: StorageUtil.getDate(message.timestamp),
        timestamp: message.timestamp,
      };
      await repository.save(data);
    }

    return "processed";
  }

  async deduplicate(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<Result>,
    account: Extension.Account
  ): Promise<Processor.DeduplicateResult<Result>> {
    return { hasDuplicate: false };
  }

  async process(message: RawEntity.Message, account: Extension.Account): Promise<Processor.ProcessResult<Result>> {
    const input = TradeRepublicMessageParser.parseMessage<TradeRepublic.TaxInformation>(message.received);
    if (!input) {
      return { data: { taxExemption: { applied: 0, used: 0, remaining: 0 } }, processed: false, warnings: [] };
    }
    const result: Result = {
      taxExemption: {
        applied: input.fsaApplied,
        used: input.fsaUsed,
        remaining: input.fsaRemaining,
      },
    };
    return { data: result, processed: true, warnings: [] };
  }
}
