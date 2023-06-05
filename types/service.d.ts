declare namespace Service {
  import FormattedMonetary = App.FormattedMonetary;
  import FormattedPercentage = App.FormattedPercentage;
  import TickerSnapshot = RawEntity.TickerSnapshot;

  interface ServiceManager {
    getTransactionService(account: Extension.Account): Promise<TransactionService>;
    getInstrumentService(account: Extension.Account): Promise<Service.InstrumentService>;
    makeInstrumentService(instruments: RawEntity.Instrument[]): Service.InstrumentService;
    makeTransactionService(instrumentService: InstrumentService): TransactionService;
  }

  interface InstrumentService {
    findByISIN(isin: string, fillDefault: true): RawEntity.Instrument;
    findByISIN(isin: string, fillDefault: false): RawEntity.Instrument | undefined;
    findByShortName(name: string): RawEntity.Instrument | undefined;
    getTimelineTitles(isin: string): string[];
  }

  type Transaction = {
    timelineId: string;
    warning: boolean;
    type: "buy" | "sell";
    method: string;
    quantity: number;
    price: FormattedMonetary;
    fee: FormattedMonetary;
    tax: FormattedMonetary;
    amount: FormattedMonetary;
    remaining: number;
    remainingAmount: FormattedMonetary;
    status: "holding" | "sold" | "partial" | "unknown" | "calculated";
    profit: {
      netAbsolute: FormattedMonetary;
      grossAbsolute: FormattedMonetary;
      netPercentage: FormattedPercentage;
      grossPercentage: FormattedPercentage;
    };
    timestamp: number;
    time: string;
    valuation: App.FormattedValuation | null;
  };

  type TimelineTransaction = Transaction & { instrument: RawEntity.Instrument };

  type TradeHistoryData = {
    transactions: Transaction[];
    count: {
      buy: number;
      sell: number;
    };
    performance: {
      dividend: FormattedMonetary;
      dividendCount: number;
      profit: FormattedMonetary;
      fee: FormattedMonetary;
      tax: FormattedMonetary;
      total: FormattedMonetary;
    };
    currentPrice: null | (FormattedMonetary & { updatedAt: string });
  };

  type TransactionTimelineInput = {
    id: string;
    type: ProcessedEntity.TimelineType;
    title: string;
    body: string;
    cashChangeAmount: Entity.Monetary;
    timestamp: number;
  };

  type TransactionTimelinePair = [TransactionTimelineInput, Entity.ITimelineDetail | undefined];

  interface TransactionInputData {
    fetch(account: Extension.Account): Promise<void>;
    findGroupByTimelineId(timelineId: string): string | undefined;
    getTimelinesOfGroup(group: string): TransactionTimelinePair[];
    getTimelinesByISIN(isin: string): TransactionTimelinePair[];
    findHoldingPosition(isin: string): ProcessedEntity.Position | undefined;
    findTickerSnapshot(isin: string): RawEntity.TickerSnapshot | undefined;
  }

  interface TransactionService {
    initialize(account: Extension.Account): Promise<void>;
    isInitialized(): boolean;
    findTransactionByTimelineId(timelineId: string): Service.TimelineTransaction | undefined;
    getTradeHistoryDataByISIN(isin: string, tickerSnapshot?: TickerSnapshot | undefined): Service.TradeHistoryData;
    getTradeHistoryDataByName(name: string): Service.TradeHistoryData;
  }
}
