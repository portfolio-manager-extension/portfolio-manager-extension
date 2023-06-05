import TransactionInputData from "./TransactionInputData";
import TradeHistoryDataFactory from "./TradeHistoryDataFactory";
import Formatter from "../../ui/app/Formatter";
import { makeEmptyTradeHistoryData } from "./makeEmptyTradeHistoryData";

export default class TransactionService implements Service.TransactionService {
  private isInit = false;
  private account: Extension.Account | undefined = undefined;
  private instrumentService: Service.InstrumentService;
  private inputData: Service.TransactionInputData;
  private transactionByTimelineIdCache: Map<string, Service.TimelineTransaction>;

  constructor(instrumentService: Service.InstrumentService, inputData: TransactionInputData) {
    this.instrumentService = instrumentService;
    this.inputData = inputData;
    this.transactionByTimelineIdCache = new Map();
  }

  async initialize(account: Extension.Account): Promise<void> {
    await this.inputData.fetch(account);
    this.account = account;
    this.isInit = true;
  }

  isInitialized(): boolean {
    return this.isInit;
  }

  findTransactionByTimelineId(timelineId: string): Service.TimelineTransaction | undefined {
    if (!this.isInit) {
      return undefined;
    }
    if (this.transactionByTimelineIdCache.has(timelineId)) {
      return this.transactionByTimelineIdCache.get(timelineId);
    }

    const group = this.inputData.findGroupByTimelineId(timelineId);
    if (!group) {
      return undefined;
    }
    const tradeHistoryData = this.getTradeHistoryDataByName(group);
    const transaction = tradeHistoryData.transactions.find(function (item) {
      return item.timelineId == timelineId;
    });
    const instrument = this.instrumentService.findByShortName(group);
    tradeHistoryData.transactions.forEach((item) => {
      this.transactionByTimelineIdCache.set(
        item.timelineId,
        Object.assign(item, {
          instrument: typeof instrument == "undefined" ? this.instrumentService.findByISIN(group, true) : instrument,
        })
      );
    });

    // @ts-ignore
    return Object.assign(transaction, {
      instrument: typeof instrument == "undefined" ? this.instrumentService.findByISIN(group, true) : instrument,
    });
  }

  getTradeHistoryDataByISIN(
    isin: string,
    tickerSnapshot?: RawEntity.TickerSnapshot | undefined
  ): Service.TradeHistoryData {
    if (!this.isInit) {
      return makeEmptyTradeHistoryData();
    }
    const instrument = this.instrumentService.findByISIN(isin, false);
    const holding = this.inputData.findHoldingPosition(isin);
    const timelines = this.inputData.getTimelinesByISIN(isin);
    const snapshot = typeof tickerSnapshot !== "undefined" ? tickerSnapshot : this.inputData.findTickerSnapshot(isin);
    return TradeHistoryDataFactory.make(
      new Formatter(this.account!.locale, this.account!.defaultCurrency),
      instrument,
      holding,
      snapshot,
      timelines
    );
  }

  getTradeHistoryDataByName(name: string): Service.TradeHistoryData {
    if (!this.isInit) {
      return makeEmptyTradeHistoryData();
    }
    const instrument = this.instrumentService.findByShortName(name);
    const holding = instrument ? this.inputData.findHoldingPosition(instrument.id) : undefined;
    const timelines = this.inputData.getTimelinesOfGroup(name);
    const snapshot = instrument ? this.inputData.findTickerSnapshot(instrument.id) : undefined;
    return TradeHistoryDataFactory.make(
      new Formatter(this.account!.locale, this.account!.defaultCurrency),
      instrument,
      holding,
      snapshot,
      timelines
    );
  }
}
