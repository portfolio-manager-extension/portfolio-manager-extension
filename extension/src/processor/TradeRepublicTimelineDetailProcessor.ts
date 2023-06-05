import TradeRepublicMessageParser from "./TradeRepublicMessageParser";
import BuyTimelineDetailReader from "./trade-republic-timeline-detail/BuyTimelineDetailReader";
import SellTimelineDetailReader from "./trade-republic-timeline-detail/SellTimelineDetailReader";
import TimelineDetailReader from "./trade-republic-timeline-detail/TimelineDetailReader";
import InterestTimelineDetailReader from "./trade-republic-timeline-detail/InterestTimelineDetailReader";
import StorageFactory from "../storage/StorageFactory";
import DividendTimelineDetailReader from "./trade-republic-timeline-detail/DividendTimelineDetailReader";

type Output = {
  detail: Entity.ITimelineDetail;
  timeline?: ProcessedEntity.Timeline;
};

export default class TradeRepublicTimelineDetailProcessor implements Processor.MessageProcessor<Output> {
  private storageFactory: Storage.StorageFactory;
  private warnings: string[] = [];

  constructor(storageFactory: Storage.StorageFactory) {
    this.storageFactory = storageFactory;
  }

  match(message: RawEntity.Message, account: Extension.Account): boolean {
    return account.source.type == "trade-republic" && message.type == "timeline-event-detail";
  }

  async store(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<Output>,
    deduplicateResult: Processor.DeduplicateResult<Output>,
    account: Extension.Account
  ): Promise<RawEntity.MessageStatus> {
    if (deduplicateResult.hasDuplicate) {
      await this.storageFactory.makeMessageRepository(account).deleteById(message.id);
      return "duplicated";
    }

    if (processResult.processed) {
      const repository = StorageFactory.makeTimelineDetailRepository(account);
      await repository.save(processResult.data.detail);

      if (processResult.warnings.length > 0) {
        return "processed-with-warning";
      }
      return "processed";
    }
    return "unprocessed";
  }

  async deduplicate(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<Output>,
    account: Extension.Account
  ): Promise<Processor.DeduplicateResult<Output>> {
    const timeline = processResult.data.timeline;
    if (timeline && timeline.type == "saving-plan-execute") {
      // if type "saving-plan-execute" it's duplicated, we do not process it
      return { hasDuplicate: true };
    }
    return { hasDuplicate: false };
  }

  async process(message: RawEntity.Message, account: Extension.Account): Promise<Processor.ProcessResult<Output>> {
    const input = TradeRepublicMessageParser.parseMessage<TradeRepublic.TimelineDetail>(message.received);
    if (!input) {
      return { data: { detail: { id: "", timestamp: 0, type: "" } }, processed: false, warnings: [] };
    }
    const repository = this.storageFactory.makeTimelineRepository(account);
    const timeline = await repository.findById(input.id);
    if (timeline) {
      const reader = this.makeReader(timeline.type, message, input);
      if (reader) {
        const data = reader.read();
        if (data) {
          if (reader.hasWarnings()) {
            console.warn(data);
          }
          return { data: { detail: data, timeline: timeline }, processed: true, warnings: reader.getWarnings() };
        }
      }
    }
    return { data: { detail: { id: "", timestamp: 0, type: "" }, timeline: timeline }, processed: false, warnings: [] };
  }

  makeReader(
    type: ProcessedEntity.TimelineType,
    message: RawEntity.Message,
    input: TradeRepublic.TimelineDetail
  ): TimelineDetailReader<any> | undefined {
    switch (type) {
      case "buy":
        return new BuyTimelineDetailReader(message, input);
      case "sell":
        return new SellTimelineDetailReader(message, input);
      case "interest":
        return new InterestTimelineDetailReader(message, input);
      case "dividend":
        return new DividendTimelineDetailReader(message, input);
      default:
        return undefined;
    }
  }
}
