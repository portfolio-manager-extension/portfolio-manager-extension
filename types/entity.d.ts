declare namespace Entity {
  interface Monetary {
    value: number;
    currency: Currency;
  }

  type InstrumentType = "fund" | "stock" | "crypto" | "derivative";

  interface ITimestamp {
    timestamp: number;
  }

  interface IDailyData extends ITimestamp {
    id: string;
    month: string;
    date: string;
  }

  interface ITimelineDetail extends ITimestamp {
    id: string;
    type: string;
  }

  interface IBuy extends ITimelineDetail {
    type: "buy";
    quantity: number; // quantity
    price: Monetary; // price per unit
    fee: Monetary; // fee of transaction
    taxBase: Monetary; // price x quantity
    amount: Monetary; // total amount of transaction
  }

  interface ISell extends ITimelineDetail {
    type: "sell";
    quantity: number; // quantity
    price: Monetary; // price per unit
    fee: Monetary; // fee of transaction
    taxBase: Monetary; // price x quantity
    tax: {
      details: {
        [key: string]: { text: string; type: string; amount: Monetary };
      };
      total: Monetary;
    };
    taxOptimized: {
      details: {
        [key: string]: { text: string; type: string; amount: Monetary };
      };
      total: Monetary;
    };
    amount: Monetary; // total amount of transaction
  }

  interface IDividend extends ITimelineDetail {
    type: "dividend";
    tax: {
      details: {
        [key: string]: { text: string; type: string; amount: Monetary };
      };
      total: Monetary;
    };
    quantity: number;
    dividendPerPiece: Monetary;
    taxBase: Monetary;
    amount: Monetary; // total amount of transaction
  }

  interface IInterest extends ITimelineDetail {
    type: "interest";
    tax: {
      details: {
        [key: string]: { text: string; type: string; amount: Monetary };
      };
      total: Monetary;
    };
    taxBase: Monetary;
    averageBalance: Monetary;
    interestRate: number;
    amount: Monetary;
  }
}
