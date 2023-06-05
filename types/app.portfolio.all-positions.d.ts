declare namespace App {
  namespace Portfolio {
    type AllPositionsData = {
      items: AllPositionsItem[];
      allocated: FormattedMonetary;
      valuation: FormattedMonetary;
      performance: {
        absolute: FormattedMonetary;
        percentage: FormattedPercentage;
      };
      balance: AllPositionsBalance;
      sortedBy: "name" | "allocated" | "valuation" | "performance";
      sortDirection: SortDirection;
      includeBalance: boolean;
      lastUpdate: string;
    };

    type AllPositionsBalance = {
      cash: FormattedMonetary;
      tooltip: {
        name: string,
        text: string,
        desc: string
      };
    };

    type AllPositionsItem = {
      isin: string;
      instrument: RawEntity.Instrument;
      portfolioIds: string[];
      size: number;
      averageBuyIn: FormattedMonetary;
      amount: FormattedMonetary;
      currentValuation: (FormattedMonetary & { updatedAt: string }) | null;
      currentPrice: (FormattedMonetary & { updatedAt: string }) | null;
      currentPerformance: {
        absolute: FormattedMonetary;
        percentage: FormattedPercentage;
      } | null;
      tooltip: {
        name: string;
        allocation: string;
        valuation: string;
        performance: string;
        portfolio: string;
      };
      timestamp: number;
    };

    type AllPositionsOptions = {
      sortedBy: "name" | "allocated" | "valuation" | "performance";
      sortDirection: SortDirection;
      includeBalance: boolean;
    };

    interface AllPositionsDataBuilder extends IDataBuilder<AllPositionsData> {
      setPositions(positions: ProcessedEntity.Position[]): this;
      setInstruments(instruments: RawEntity.Instrument[]): this;
      setTickerSnapshots(tickerSnapshots: RawEntity.TickerSnapshot[]): this;
      setDailyCash(cash: ProcessedEntity.DailyCash | undefined): this;
      setPortfolios(portfolios: CustomEntity.Portfolio[]): this;
      setPortfolioInstruments(portfolioInstruments: CustomEntity.PortfolioInstrument[]): this;
      setOptions(options: AllPositionsOptions): this;
    }

    interface AllPositionsDataDirector extends IDataDirector<AllPositionsData, AllPositionsOptions> {}
  }
}
