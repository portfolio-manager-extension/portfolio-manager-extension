import TradeRepublicTimelineEventsProcessor from "./TradeRepublicTimelineEventsProcessor";
import TradeRepublicTimelineAccountBalanceProcessor from "./TradeRepublicTimelineAccountBalanceProcessor";
import TradeRepublicPositionsProcessor from "./TradeRepublicPositionsProcessor";
import TradeRepublicTimelineDetailProcessor from "./TradeRepublicTimelineDetailProcessor";
import TradeRepublicInstrumentInfoProcessor from "./TradeRepublicInstrumentInfoProcessor";
import TradeRepublicRealtimeTickerInstantaneousProcessor from "./TradeRepublicRealtimeTickerInstantaneousProcessor";
import TradeRepublicCashProcessor from "./TradeRepublicCashProcessor";
import TradeRepublicTaxInformationProcessor from "./TradeRepublicTaxInformationProcessor";

export class ProcessorManager implements Processor.Manager {
  private readonly storageFactory: Storage.StorageFactory;
  private readonly processors: Processor.MessageProcessor<any>[];
  private readonly instantaneousProcessors: Processor.MessageInstantaneousProcessor[];

  constructor(storageFactory: Storage.StorageFactory) {
    this.processors = [
      new TradeRepublicTimelineEventsProcessor(storageFactory),
      new TradeRepublicTimelineAccountBalanceProcessor(storageFactory),
      new TradeRepublicPositionsProcessor(storageFactory),
      new TradeRepublicTimelineDetailProcessor(storageFactory),
      new TradeRepublicInstrumentInfoProcessor(storageFactory),
      new TradeRepublicCashProcessor(storageFactory),
      new TradeRepublicTaxInformationProcessor(storageFactory),
    ];
    this.instantaneousProcessors = [new TradeRepublicRealtimeTickerInstantaneousProcessor(storageFactory)];
    this.storageFactory = storageFactory;
  }

  processInstantaneously(message: Processor.InstantaneousMessage, account: Extension.Account): boolean {
    let matched = false;
    for (const processor of this.instantaneousProcessors) {
      if (!processor.match(message, account)) {
        continue;
      }

      processor.process(message, account);
      matched = true;
    }
    return matched;
  }

  async process(entity: RawEntity.Message, account: Extension.Account): Promise<RawEntity.MessageStatus> {
    let status: RawEntity.MessageStatus = "unprocessed";
    for (const processor of this.processors) {
      if (!processor.match(entity, account)) {
        continue;
      }

      const processResult = await processor.process(entity, account);
      const deduplicateResult = await processor.deduplicate(entity, processResult, account);
      status = await processor.store(entity, processResult, deduplicateResult, account);
    }
    return status;
  }

  async reprocess(messageId: string, account: Extension.Account): Promise<RawEntity.MessageStatus> {
    const messageRepository = this.storageFactory.makeMessageRepository(account);
    const entity = await messageRepository.findById(messageId);
    if (entity) {
      const result = await this.process(entity, account);
      await messageRepository.updateStatusById(entity.id, result);
      return result;
    }
    return "unprocessed";
  }
}
