declare namespace App {
  namespace Portfolio {
    type CustomPortfolioData = {
      overview: PortfolioOverview;
      positions: PortfolioPositionItem[];
    };

    type CustomPortfolioOptions = {
      portfolioId: string;
    };

    type PortfolioOverview = {
      allocation: {
        amount: FormattedMonetary; // amount allocated to current portfolio
        percentage: FormattedPercentage; // percentage allocated to current portfolio
        holdingTotal: FormattedMonetary; // total value of holding positions
        count: { position: number; buy: number; sell: number };
      };
      valuation: FormattedValuation;
      realized: {
        dividend: FormattedMonetary;
        dividendCount: number;
        profit: FormattedMonetary;
        fee: FormattedMonetary;
        tax: FormattedMonetary;
        total: FormattedMonetary;
      };
    };

    type PortfolioPositionItem = {
      instrument: RawEntity.Instrument;
      size: number;
      averageBuyIn: FormattedMonetary;
      amount: FormattedMonetary;
      percentage: FormattedPercentage;
      valuation: FormattedValuation | null;
      tradeHistory: Service.TradeHistoryData;
      order: number;
      treeMapTooltip: {
        name: string;
        allocation: string;
        valuation: string;
        performance: string;
      };
    };

    type ManageInstrumentsData = {
      availableItems: AvailableInstrumentItem[];
      assignedItems: AssignedInstrumentItem[];
    };

    type AvailableInstrumentItem = {
      isin: string;
      name: string;
      portfolioNames: string[];
      holding: boolean;
      holdingSize: string;
    };

    type AssignedInstrumentItem = {
      id: string;
      isin: string;
      name: string;
      holding: boolean;
      holdingSize: string;
      order: number;
    };

    interface CustomPortfolioDataBuilder extends IDataBuilder<CustomPortfolioData> {
      setPositions(positions: ProcessedEntity.Position[]): this;
      setPortfolioInstruments(portfolioInstruments: CustomEntity.PortfolioInstrument[]): this;
      setInstruments(instruments: RawEntity.Instrument[]): this;
      setTickerSnapshots(tickerSnapshots: RawEntity.TickerSnapshot[]): this;
      setTransactionService(transactionService: Service.TransactionService): this;
    }

    interface CustomPortfolioDataDirector extends IDataDirector<CustomPortfolioData, CustomPortfolioOptions> {}

    type ManageInstrumentsDataOptions = {
      portfolioId: string;
    };

    interface ManageInstrumentsDataBuilder extends IDataBuilder<ManageInstrumentsData> {
      setPortfolios(portfolios: CustomEntity.Portfolio[]): this;
      setPositions(positions: ProcessedEntity.Position[]): this;
      setPortfolioInstruments(portfolioInstruments: CustomEntity.PortfolioInstrument[]): this;
      setInstruments(instruments: RawEntity.Instrument[]): this;
      setCurrentPortfolioId(portfolioId: string): this;
    }

    interface ManageInstrumentsDataDirector
      extends IDataDirector<ManageInstrumentsData, ManageInstrumentsDataOptions> {}
  }
}
