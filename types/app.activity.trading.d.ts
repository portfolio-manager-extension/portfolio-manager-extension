declare namespace App {
  namespace Activity {
    type TradingData = {
      months: TradingMonth[];
      years: number[];
      fee: FormattedMonetary;
      tax: FormattedMonetary;
      amount: FormattedMonetary;
      profit: FormattedMonetary;
    };

    type TradingMonth = {
      time: string;
      items: TradingItem[];
      desc: string;
      count: { buy: number; sell: number };
      buy: FormattedMonetary;
      sell: FormattedMonetary;
      netChanged: FormattedMonetary;
      fee: FormattedMonetary;
      tax: FormattedMonetary;
      profit: FormattedMonetary;
      investedAggregate: FormattedMonetary;
    };

    type TradingItem = {
      time: string;
      timelineId: string;
      type: "buy" | "sell";
      desc: string;
      quantity: number;
      amount: FormattedMonetary;
      fee: FormattedMonetary;
      tax: FormattedMonetary;
      profit: {
        netAbsolute: FormattedMonetary;
        grossAbsolute: FormattedMonetary;
        netPercentage: FormattedPercentage;
        grossPercentage: FormattedPercentage;
      };
    };

    type TradingDataOptions = {
      filteredYears: number[] | undefined;
    };

    interface TradingDataBuilder extends IDataBuilder<TradingData> {
      setTimelines(timelines: ProcessedEntity.Timeline[]): this;
      setTransactionService(transactionService: Service.TransactionService): this;
      setFilteredYears(filteredYears: number[] | undefined): this;
    }

    interface TradingDataDirector extends IDataDirector<TradingData, TradingDataOptions> {}
  }
}
