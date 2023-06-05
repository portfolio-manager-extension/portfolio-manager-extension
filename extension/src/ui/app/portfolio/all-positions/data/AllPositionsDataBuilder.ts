import { getDefaultFormatter } from "../../../Formatter";
import CommonDataCollector from "../../../../CommonDataCollector";
import ServiceManager from "../../../../../service/ServiceManager";

export default class AllPositionsDataBuilder implements App.Portfolio.AllPositionsDataBuilder {
  private positions: ProcessedEntity.Position[] = [];
  private instrumentService: Service.InstrumentService = ServiceManager.makeInstrumentService([]);
  private tickerSnapshots: Map<string, RawEntity.TickerSnapshot> = new Map();
  private cash: ProcessedEntity.DailyCash | undefined;
  private activePortfolios: Map<string, string> = new Map();
  private portfolioInstruments: Map<string, CustomEntity.PortfolioInstrument[]> = new Map();
  private options: App.Portfolio.AllPositionsOptions = {
    sortedBy: "name",
    sortDirection: "asc",
    includeBalance: true,
  };
  private formatter: App.IFormatter = getDefaultFormatter();

  reset(): this {
    this.positions = [];
    this.instrumentService = ServiceManager.makeInstrumentService([]);
    this.tickerSnapshots = new Map();
    this.cash = undefined;
    this.activePortfolios = new Map();
    this.portfolioInstruments = new Map();
    this.options = {
      sortedBy: "name",
      sortDirection: "asc",
      includeBalance: true,
    };
    this.formatter = getDefaultFormatter();
    return this;
  }

  setFormatter(formatter: App.IFormatter): this {
    this.formatter = formatter;
    return this;
  }

  setPositions(positions: ProcessedEntity.Position[]): this {
    this.positions = positions;
    return this;
  }

  setInstruments(instruments: RawEntity.Instrument[]): this {
    this.instrumentService = ServiceManager.makeInstrumentService(instruments);
    return this;
  }

  setTickerSnapshots(tickerSnapshots: RawEntity.TickerSnapshot[]): this {
    tickerSnapshots.forEach((snapshot) => {
      this.tickerSnapshots.set(snapshot.instrumentId, snapshot);
    });
    return this;
  }

  setDailyCash(cash: ProcessedEntity.DailyCash | undefined): this {
    this.cash = cash;
    return this;
  }

  setPortfolios(portfolios: CustomEntity.Portfolio[]): this {
    portfolios.forEach((item) => {
      this.activePortfolios.set(item.id, item.name);
    });
    return this;
  }

  setPortfolioInstruments(portfolioInstruments: CustomEntity.PortfolioInstrument[]): this {
    portfolioInstruments.forEach((item) => {
      if (!this.activePortfolios.has(item.portfolioId)) {
        return;
      }
      if (this.portfolioInstruments.has(item.instrumentId)) {
        this.portfolioInstruments.get(item.instrumentId)!.push(item);
      } else {
        this.portfolioInstruments.set(item.instrumentId, [item]);
      }
    });
    return this;
  }

  setOptions(options: App.Portfolio.AllPositionsOptions): this {
    this.options = options;
    return this;
  }

  build(): App.Portfolio.AllPositionsData {
    const collector = new CommonDataCollector<App.Portfolio.AllPositionsItem>(
      undefined,
      this.formatter.defaultCurrency
    );
    collector.defineCustomSum("valuation");
    collector.defineCustomSum("performance");

    const items = this.positions.map((position) => {
      const item = this.buildItem(position);
      collector.collectItem(item).addTotal(item.amount.value);
      if (item.currentValuation) {
        collector.addToCustomSum("valuation", item.currentValuation.value);
      }
      if (item.currentPerformance) {
        collector.addToCustomSum("performance", item.currentPerformance.absolute.value);
      }

      return item;
    });

    const performanceAbsolute = collector.getCustomSumValue("performance");
    const performancePercentage = collector.getTotal() == 0 ? 0 : performanceAbsolute / collector.getTotal();
    const totalAllocation = collector.getTotal();
    const cash = this.formatter.monetary(
      typeof this.cash !== "undefined"
        ? { value: parseFloat(this.cash.amount), currency: this.cash.currency }
        : { value: 0, currency: this.formatter.defaultCurrency }
    );
    const cashPercentage = this.formatter.percentage({
      value: totalAllocation == 0 ? 0 : cash.value / totalAllocation,
    });
    const allocated = this.formatter.monetary({
      value: collector.getTotal(),
      currency: this.formatter.defaultCurrency,
    });

    return {
      items: this.updateTooltip(this.sortItems(items), collector.getTotal(), collector.getCustomSumValue("valuation")),
      allocated: allocated,
      valuation: this.formatter.monetary({
        value: collector.getCustomSumValue("valuation"),
        currency: this.formatter.defaultCurrency,
      }),
      performance: {
        absolute: this.formatter.monetary({
          value: performanceAbsolute,
          currency: this.formatter.defaultCurrency,
        }),
        percentage: this.formatter.percentage({ value: performancePercentage }),
      },
      balance: {
        cash: cash,
        tooltip: {
          name: "Balance",
          text: `Cash ${cash.text} = ${cashPercentage.text} of ${allocated.text} allocated`,
          desc: `Cash is not included when calculating percentage of position`,
        },
      },
      sortedBy: this.options.sortedBy,
      sortDirection: this.options.sortDirection,
      includeBalance: this.options.includeBalance,
      lastUpdate: "",
    };
  }

  private updateTooltip(
    items: App.Portfolio.AllPositionsItem[],
    allocation: number,
    totalValuation: number
  ): App.Portfolio.AllPositionsItem[] {
    return items.map((item) => {
      const allocationPercentage = this.formatter.percentage({ value: item.amount.value / allocation });
      let valuation = "";
      if (item.currentValuation) {
        const valuationPercentage = this.formatter.percentage({ value: item.currentValuation.value / totalValuation });
        valuation = `Current valuation: ${item.currentValuation.text} (${valuationPercentage.text})`;
      }

      let performance = "";
      if (item.currentPerformance) {
        const sign = item.currentPerformance.absolute.value < 0 ? "-" : "+";
        performance = `Performance: ${sign}${item.currentPerformance.absolute.text} (${sign}${item.currentPerformance.percentage.text})`;
      }

      let portfolio = "";
      const portfolioNames = this.getPortfolioNames(item.portfolioIds);
      if (portfolioNames.length > 0) {
        portfolio = "Portfolio: " + this.getPortfolioNames(item.portfolioIds).join(", ");
      }
      return Object.assign(item, {
        tooltip: {
          name: item.instrument.shortName,
          allocation: `Allocated: ${item.amount.text} (${allocationPercentage.text})`,
          performance: performance,
          valuation: valuation,
          portfolio: portfolio,
        },
      });
    });
  }

  private sortItems(items: App.Portfolio.AllPositionsItem[]): App.Portfolio.AllPositionsItem[] {
    return items.sort((a, b) => {
      if (this.options.sortedBy == "name") {
        if (this.options.sortDirection == "asc") {
          return a.instrument.shortName.localeCompare(b.instrument.shortName);
        }
        return b.instrument.shortName.localeCompare(a.instrument.shortName);
      }

      let valueA: number = 0;
      let valueB: number = 0;
      switch (this.options.sortedBy) {
        case "allocated":
          valueA = a.amount.value;
          valueB = b.amount.value;
          break;
        case "performance":
          valueA = a.currentPerformance ? a.currentPerformance.absolute.value : 0;
          valueB = b.currentPerformance ? b.currentPerformance.absolute.value : 0;
          break;
        case "valuation":
          valueA = a.currentValuation ? a.currentValuation.value : 0;
          valueB = b.currentValuation ? b.currentValuation.value : 0;
          break;
      }

      if (valueA == valueB) {
        return 0;
      }
      if (this.options.sortDirection == "desc") {
        return valueA < valueB ? -1 : 1;
      }
      return valueA < valueB ? 1 : -1;
    });
  }

  private buildItem(position: ProcessedEntity.Position): App.Portfolio.AllPositionsItem {
    const size = parseFloat(position.netSize);
    const averageBuyIn = parseFloat(position.averageBuyIn);
    const amount = size * averageBuyIn;
    const instrument = this.instrumentService.findByISIN(position.isin, true);
    const snapshot = this.tickerSnapshots.get(position.isin);
    let currentValuation = null;
    let currentPrice = null;
    let currentPerformance = null;
    if (snapshot) {
      currentValuation = this.formatter.monetary({
        value: size * parseFloat(snapshot.value),
        currency: this.formatter.defaultCurrency,
      });
      currentPrice = this.formatter.monetary({
        value: parseFloat(snapshot.value),
        currency: this.formatter.defaultCurrency,
      });

      currentValuation = Object.assign(currentValuation, {
        updatedAt: this.formatter.datetime(snapshot.timestamp),
      });
      currentPrice = Object.assign(currentPrice, {
        updatedAt: this.formatter.datetime(snapshot.timestamp),
      });

      const absolute = currentValuation.value - amount;
      const percentage = amount == 0 ? 0 : absolute / amount;
      currentPerformance = {
        absolute: this.formatter.monetary({ value: absolute, currency: this.formatter.defaultCurrency }),
        percentage: this.formatter.percentage({ value: percentage }),
      };
    }

    return {
      isin: position.isin,
      instrument: instrument,
      portfolioIds: this.getPortfolioIds(instrument),
      size: size,
      averageBuyIn: this.formatter.monetary({ value: averageBuyIn, currency: this.formatter.defaultCurrency }),
      amount: this.formatter.monetary({ value: amount, currency: this.formatter.defaultCurrency }),
      currentValuation: currentValuation,
      currentPrice: currentPrice,
      currentPerformance: currentPerformance,
      timestamp: position.timestamp,
      tooltip: {
        name: instrument.shortName,
        allocation: "",
        performance: "",
        valuation: "",
        portfolio: "",
      },
    };
  }

  getPortfolioIds(instrument: RawEntity.Instrument): string[] {
    if (!this.portfolioInstruments.has(instrument.id)) {
      return [];
    }
    return this.portfolioInstruments.get(instrument.id)!.map(function (item) {
      return item.portfolioId;
    });
  }

  getPortfolioNames(ids: string[]): string[] {
    // @ts-ignore
    const result: string[] = ids
      .map((id) => {
        if (this.activePortfolios.has(id)) {
          return this.activePortfolios.get(id);
        }
        return "";
      })
      .filter(function (item) {
        return typeof item != "undefined" && item != "";
      });
    return result;
  }
}
