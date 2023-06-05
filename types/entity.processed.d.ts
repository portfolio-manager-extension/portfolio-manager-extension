declare namespace ProcessedEntity {
  import IDailyData = Entity.IDailyData;
  type ITimelineTypeKeyed<T> = {
    buy: T;
    sell: T;
    "saving-plan-execute": T;
    dividend: T;
    interest: T;
    deposit: T;
    withdraw: T;
    "credit-shares": T;
    "award-money": T;
    "tax-payment-back": T;
    info: T;
    unused: T;
    unknown: T;
  };
  type TimelineType = keyof ITimelineTypeKeyed<any>;

  interface Timeline extends Entity.ITimestamp {
    id: string;
    messageId: string;
    type: TimelineType;
    title: LocalizedText;
    body: LocalizedText;
    cashChangeAmount: Entity.Monetary;
    month: string;
    attributes?: Localized<any[]>;
    icon?: string;
  }

  interface QuarterlyBalance extends Entity.ITimestamp {
    id: string;
    messageId: string;
    portfolioValue: Entity.Monetary;
    cashAccount: Entity.Monetary;
    title: LocalizedText;
    absolutePerformance: number;
    relativePerformance: number;
  }

  interface Interest extends Entity.IInterest {}
  interface Buy extends Entity.IBuy {}
  interface Sell extends Entity.ISell {}
  interface Dividend extends Entity.IDividend {}

  interface DailyCash extends IDailyData {
    amount: string;
    currency: string;
  }
  interface DailyAvailableCash extends IDailyData {
    amount: string;
    currency: string;
  }

  interface DailyTaxInformation extends IDailyData {
    taxExemption: {
      applied: number;
      used: number;
      remaining: number;
    };
  }

  type PositionStatus = "holding" | "sold";

  interface Position extends Entity.ITimestamp {
    id: string;
    isin: string;
    netSize: string; // it's a number, but we store in string to avoid parsing/fraction slip
    averageBuyIn: string; // it's a number, but we store in string to avoid parsing/fraction slip
    month: string;
    date: string;
    status: PositionStatus;
  }

  type TickerValue = {
    time: number;
    price: string;
    size: number;
  };

  type RealtimeTicker = {
    id: string;
    last: TickerValue;
    ask: TickerValue;
    bid: TickerValue;
    open: TickerValue;
    pre: TickerValue;
    delta: string | null;
    // TODO: check the type of leverage
    leverage: any | null;
  };
}
