import { getDefaultFormatter } from "../../../Formatter";
import CommonDataCollector from "../../../../CommonDataCollector";
import ServiceManager from "../../../../../service/ServiceManager";

export default class CustomPortfolioDataBuilder implements App.Portfolio.CustomPortfolioDataBuilder {
  private portfolioInstruments: CustomEntity.PortfolioInstrument[] = [];
  private positions: ProcessedEntity.Position[] = [];
  private positionMap: Map<string, ProcessedEntity.Position> = new Map();
  private tickerSnapshots: Map<string, RawEntity.TickerSnapshot> = new Map();
  private formatter: App.IFormatter = getDefaultFormatter();
  private instrumentService: Service.InstrumentService = ServiceManager.makeInstrumentService([]);
  private transactionService: Service.TransactionService = ServiceManager.makeTransactionService(
    this.instrumentService
  );

  reset(): this {
    this.portfolioInstruments = [];
    this.positions = [];
    this.positionMap = new Map();
    this.tickerSnapshots = new Map();
    this.formatter = getDefaultFormatter();
    this.instrumentService = ServiceManager.makeInstrumentService([]);
    this.transactionService = ServiceManager.makeTransactionService(this.instrumentService);
    return this;
  }

  setFormatter(formatter: App.IFormatter): this {
    this.formatter = getDefaultFormatter();
    return this;
  }

  setPositions(positions: ProcessedEntity.Position[]): this {
    this.positions = positions;
    positions.forEach((item) => {
      this.positionMap.set(item.isin, item);
    });
    return this;
  }

  setPortfolioInstruments(portfolioInstruments: CustomEntity.PortfolioInstrument[]): this {
    this.portfolioInstruments = portfolioInstruments;
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

  setTransactionService(transactionService: Service.TransactionService): this {
    this.transactionService = transactionService;
    return this;
  }

  build(): App.Portfolio.CustomPortfolioData {
    const allPositionsAmount = this.positions.reduce(function (sum, position) {
      return sum + parseFloat(position.netSize) * parseFloat(position.averageBuyIn);
    }, 0);
    const collector = new CommonDataCollector<App.Portfolio.PortfolioPositionItem>(
      undefined,
      this.formatter.defaultCurrency
    );
    collector.defineCustomSum("valuation");
    let buyTransactionCount = 0;
    let sellTransactionCount = 0;
    const realized = {
      dividend: 0,
      dividendCount: 0,
      profit: 0,
      fee: 0,
      tax: 0,
    };

    this.portfolioInstruments.map((portfolioInstrument) => {
      const item = this.buildPortfolioPositionItem(portfolioInstrument);
      if (typeof item !== "undefined") {
        collector
          .collectItem(item)
          .addTotal(item.amount.value)
          .addToCustomSum("valuation", item.valuation == null ? 0 : item.valuation.valuation.value);

        buyTransactionCount += item.tradeHistory.count.buy;
        sellTransactionCount += item.tradeHistory.count.sell;
        realized.dividend += item.tradeHistory.performance.dividend.value;
        realized.dividendCount += item.tradeHistory.performance.dividendCount;
        realized.profit += item.tradeHistory.performance.profit.value;
        realized.fee += item.tradeHistory.performance.fee.value;
        realized.tax += item.tradeHistory.performance.tax.value;
      }
    });

    const valuation = collector.getCustomSumValue("valuation");
    const total = collector.getTotal();
    const positions = collector.getCollectedItems();

    return {
      overview: {
        allocation: {
          amount: this.formatter.monetary({ value: collector.getTotal(), currency: this.formatter.defaultCurrency }),
          percentage: this.formatter.percentage({
            value: allPositionsAmount == 0 ? 0 : total / allPositionsAmount,
          }),
          holdingTotal: this.formatter.monetary({
            value: allPositionsAmount,
            currency: this.formatter.defaultCurrency,
          }),
          count: { position: positions.length, buy: buyTransactionCount, sell: sellTransactionCount },
        },
        valuation: this.formatter.valuation(
          {
            value: valuation,
            currency: this.formatter.defaultCurrency,
          },
          {
            value: valuation - total,
            currency: this.formatter.defaultCurrency,
          },
          { value: total == 0 ? 0 : (valuation - total) / total },
          0
        ),
        realized: {
          dividend: this.formatter.monetary({ value: realized.dividend, currency: this.formatter.defaultCurrency }),
          dividendCount: realized.dividendCount,
          tax: this.formatter.monetary({ value: realized.tax, currency: this.formatter.defaultCurrency }),
          fee: this.formatter.monetary({ value: realized.fee, currency: this.formatter.defaultCurrency }),
          profit: this.formatter.monetary({ value: realized.profit, currency: this.formatter.defaultCurrency }),
          total: this.formatter.monetary({
            value: realized.profit + realized.dividend - Math.abs(realized.fee) - Math.abs(realized.tax),
            currency: this.formatter.defaultCurrency,
          }),
        },
      },
      positions: this.updateTooltip(
        positions.sort(function (a, b) {
          if (a.order == b.order) {
            return 0;
          }
          return a.order < b.order ? -1 : 1;
        }),
        collector.getTotal(),
        valuation
      ),
    };
  }

  private updateTooltip(
    items: App.Portfolio.PortfolioPositionItem[],
    allocation: number,
    totalValuation: number
  ): App.Portfolio.PortfolioPositionItem[] {
    return items.map((item) => {
      const allocationPercentage = this.formatter.percentage({ value: item.amount.value / allocation });
      let valuation = "";
      if (item.valuation) {
        const valuationPercentage = this.formatter.percentage({
          value: item.valuation.valuation.value / totalValuation,
        });
        valuation = `Current valuation: ${item.valuation.valuation.text} (${valuationPercentage.text})`;
      }

      let performance = "";
      if (item.valuation) {
        const sign = item.valuation.absolute.value < 0 ? "-" : "+";
        performance = `Performance: ${sign}${item.valuation.absolute.text} (${sign}${item.valuation.percentage.text})`;
      }

      return Object.assign(item, {
        treeMapTooltip: {
          name: item.instrument.shortName,
          allocation: `Allocated: ${item.amount.text} (${allocationPercentage.text})`,
          performance: performance,
          valuation: valuation,
        },
      });
    });
  }

  private buildPortfolioPositionItem(
    portfolioInstrument: CustomEntity.PortfolioInstrument
  ): App.Portfolio.PortfolioPositionItem | undefined {
    const position = this.positionMap.get(portfolioInstrument.instrumentId);
    if (!position) {
      const instrument = this.instrumentService.findByISIN(portfolioInstrument.instrumentId, true);
      return {
        instrument: instrument,
        size: 0,
        averageBuyIn: this.formatter.monetary({ value: 0, currency: this.formatter.defaultCurrency }),
        amount: this.formatter.monetary({ value: 0, currency: this.formatter.defaultCurrency }),
        percentage: { value: 0, text: "" },
        valuation: null,
        tradeHistory: this.transactionService.getTradeHistoryDataByISIN(portfolioInstrument.instrumentId),
        order: portfolioInstrument.order,
        treeMapTooltip: {
          name: instrument.shortName,
          valuation: "",
          performance: "",
          allocation: "",
        },
      };
    }
    const size = parseFloat(position.netSize);
    const averageBuyIn = parseFloat(position.averageBuyIn);
    const snapshot = this.tickerSnapshots.get(position.isin);
    const amount = size * averageBuyIn;
    let valuation = null;
    if (snapshot) {
      const valuationValue = size * parseFloat(snapshot.value);
      valuation = this.formatter.valuation(
        {
          value: valuationValue,
          currency: this.formatter.defaultCurrency,
        },
        {
          value: valuationValue - amount,
          currency: this.formatter.defaultCurrency,
        },
        { value: amount == 0 ? 0 : (valuationValue - amount) / amount },
        0
      );
    }

    const instrument = this.instrumentService.findByISIN(portfolioInstrument.instrumentId, true);
    return {
      instrument: instrument,
      size: size,
      averageBuyIn: this.formatter.monetary({ value: averageBuyIn, currency: this.formatter.defaultCurrency }),
      amount: this.formatter.monetary({ value: amount, currency: this.formatter.defaultCurrency }),
      percentage: { value: 0, text: "" },
      valuation: valuation,
      tradeHistory: this.transactionService.getTradeHistoryDataByISIN(position.isin),
      order: portfolioInstrument.order,
      treeMapTooltip: {
        name: instrument.shortName,
        valuation: "",
        performance: "",
        allocation: "",
      },
    };
  }
}
