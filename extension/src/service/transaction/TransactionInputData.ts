import { sortByTimestampAsc } from "../../ui/app/fn/sortByTimestamp";

const TIMELINE_TYPES_COLLECTED: ProcessedEntity.ITimelineTypeKeyed<boolean> = {
  "award-money": false,
  "credit-shares": false,
  "tax-payment-back": false,
  info: false,
  interest: false,
  unknown: false,
  unused: false,
  withdraw: false,
  deposit: false,
  // ------------------
  "saving-plan-execute": true,
  dividend: true,
  sell: true,
  buy: true,
};

export default class TransactionInputData implements Service.TransactionInputData {
  private storageFactory: Storage.StorageFactory;
  private fetched = false;
  private timelineIdToTitleMap: Map<string, string>;
  private timelineGroupedByTitleMap: Map<string, Service.TransactionTimelineInput[]>;
  private timelineDetailsMap: Map<string, Entity.ITimelineDetail>;
  private holdingPositions: Map<string, ProcessedEntity.Position>;
  private soldPositions: Map<string, ProcessedEntity.Position>;
  private tickerSnapshots: Map<string, RawEntity.TickerSnapshot>;
  private instrumentService: Service.InstrumentService;

  constructor(storageFactory: Storage.StorageFactory, instrumentService: Service.InstrumentService) {
    this.storageFactory = storageFactory;
    this.instrumentService = instrumentService;
    this.timelineIdToTitleMap = new Map();
    this.timelineGroupedByTitleMap = new Map();
    this.timelineDetailsMap = new Map();
    this.holdingPositions = new Map();
    this.soldPositions = new Map();
    this.tickerSnapshots = new Map();
  }

  async fetch(account: Extension.Account) {
    if (this.fetched) {
      return;
    }

    await this.storageFactory.makeTimelineRepository(account).each((timeline) => {
      if (!TIMELINE_TYPES_COLLECTED[timeline.type]) {
        return;
      }
      const timelineInput = this.makeTimelineInput(timeline);
      this.timelineIdToTitleMap.set(timelineInput.id, timelineInput.title);
      if (this.timelineGroupedByTitleMap.has(timelineInput.title)) {
        this.timelineGroupedByTitleMap.get(timelineInput.title)!.push(timelineInput);
      } else {
        this.timelineGroupedByTitleMap.set(timelineInput.title, [timelineInput]);
      }
    });
    await this.storageFactory.makeTimelineDetailRepository(account).each((timelineDetail) => {
      if (timelineDetail.type == "buy" || timelineDetail.type == "sell" || timelineDetail.type == "dividend") {
        this.timelineDetailsMap.set(timelineDetail.id, timelineDetail);
      }
    });
    (await this.storageFactory.makePositionRepository(account).getAll()).forEach((position) => {
      if (position.status == "holding") {
        this.holdingPositions.set(position.isin, position);
      }
      if (position.status == "sold") {
        this.soldPositions.set(position.isin, position);
      }
    });
    const tickerSnapshots = await this.storageFactory.makeTickerSnapshotRepository(account).getAllLatest();
    tickerSnapshots.forEach((snapshot) => {
      this.tickerSnapshots.set(snapshot.instrumentId, snapshot);
    });
    this.fetched = true;
  }

  findGroupByTimelineId(timelineId: string): string | undefined {
    if (this.timelineIdToTitleMap.has(timelineId)) {
      return this.timelineIdToTitleMap.get(timelineId)!;
    }
    return undefined;
  }

  getTimelinesOfGroup(groupId: string): Service.TransactionTimelinePair[] {
    const instrument = this.instrumentService.findByShortName(groupId);
    if (instrument) {
      return this.getTimelinesByISIN(instrument.id);
    }
    const items = this.timelineGroupedByTitleMap.get(groupId)!;
    if (items) {
      return sortByTimestampAsc(items).map((item) => this.makePair(item));
    }
    return [];
  }

  getTimelinesByISIN(isin: string): Service.TransactionTimelinePair[] {
    const titles = this.instrumentService.getTimelineTitles(isin);
    const timelines: Service.TransactionTimelineInput[] = [];
    for (const title of titles) {
      const items = this.timelineGroupedByTitleMap.get(title);
      if (items) {
        for (const item of items) timelines.push(item);
      }
    }
    return sortByTimestampAsc(timelines).map((item) => this.makePair(item));
  }

  findHoldingPosition(isin: string): ProcessedEntity.Position | undefined {
    return this.holdingPositions.get(isin);
  }

  findTickerSnapshot(isin: string): RawEntity.TickerSnapshot | undefined {
    return this.tickerSnapshots.get(isin);
  }

  makePair(timeline: Service.TransactionTimelineInput): Service.TransactionTimelinePair {
    return [timeline, this.timelineDetailsMap.get(timeline.id)];
  }

  makeTimelineInput(timeline: ProcessedEntity.Timeline): Service.TransactionTimelineInput {
    return {
      id: timeline.id,
      type: timeline.type,
      title: timeline.title.default,
      body: timeline.body.default,
      cashChangeAmount: timeline.cashChangeAmount,
      timestamp: timeline.timestamp,
    };
  }
}
