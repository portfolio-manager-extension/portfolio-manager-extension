import TradeRepublicMessageParser from "./TradeRepublicMessageParser";
import { v4 as uuid } from "uuid";
import { StorageUtil } from "../storage/StorageUtil";

type Result = {
  currencyId: string;
  amount: string;
};

export default class TradeRepublicCashProcessor implements Processor.MessageProcessor<Result> {
  private storageFactory: Storage.StorageFactory;

  constructor(storageFactory: Storage.StorageFactory) {
    this.storageFactory = storageFactory;
  }

  match(message: RawEntity.Message, account: Extension.Account): boolean {
    return account.source.type == "trade-republic" && (message.type == "cash" || message.type == "available-cash");
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
    const repository =
      message.type == "cash"
        ? this.storageFactory.makeDailyCashRepository(account)
        : this.storageFactory.makeDailyAvailableCashRepository(account);
    const exist = await repository.findCurrent(message.timestamp);
    if (exist) {
      exist.amount = processResult.data.amount;
      exist.currency = processResult.data.currencyId;
      exist.timestamp = message.timestamp;
      await repository.save(exist);
    } else {
      const data: ProcessedEntity.DailyCash = {
        id: uuid(),
        amount: processResult.data.amount,
        currency: processResult.data.currencyId,
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
    const input = TradeRepublicMessageParser.parseMessage<Array<Result>>(message.received);
    if (!input || input.length == 0) {
      return { data: { currencyId: "", amount: "" }, processed: false, warnings: [] };
    }
    return { data: input[0], processed: true, warnings: [] };
  }
}
