import { getDefaultFormatter } from "../../../Formatter";
import { sortByTimestampAsc } from "../../../fn/sortByTimestamp";
import ServiceManager from "../../../../../service/ServiceManager";
import CommonDataCollector from "../../../../CommonDataCollector";
import { getCountString } from "../../../fn/getCountString";
import Monetary = Entity.Monetary;

export default class TradingDataBuilder implements App.Activity.TradingDataBuilder {
  private timelines: ProcessedEntity.Timeline[] = [];
  private transactionService: Service.TransactionService = ServiceManager.makeTransactionService(
    ServiceManager.makeInstrumentService([])
  );
  private filteredYears: number[] | undefined = undefined;
  private formatter: App.IFormatter = getDefaultFormatter();

  reset(): this {
    this.timelines = [];
    this.transactionService = ServiceManager.makeTransactionService(ServiceManager.makeInstrumentService([]));
    this.filteredYears = undefined;
    this.formatter = getDefaultFormatter();

    return this;
  }

  setFormatter(formatter: App.IFormatter): this {
    this.formatter = formatter;

    return this;
  }

  setTimelines(timelines: ProcessedEntity.Timeline[]): this {
    this.timelines = sortByTimestampAsc(timelines);

    return this;
  }

  setTransactionService(transactionService: Service.TransactionService): this {
    this.transactionService = transactionService;

    return this;
  }

  setFilteredYears(filteredYears: number[] | undefined): this {
    this.filteredYears = filteredYears;
    return this;
  }

  build(): App.Activity.TradingData {
    const collector = new CommonDataCollector<App.Activity.TradingMonth>(
      this.filteredYears,
      this.formatter.defaultCurrency
    );
    collector.defineCustomSum("fee");
    collector.defineCustomSum("tax");
    collector.defineCustomSum("amount");
    collector.defineCustomSum("profit");
    const groupedMap = new Map<string, ProcessedEntity.Timeline[]>();

    this.timelines.forEach((timeline) => {
      if (!collector.canCollectData(timeline)) {
        return;
      }

      const month = this.formatter.month(timeline.timestamp);
      if (groupedMap.has(month)) {
        groupedMap.get(month)!.push(timeline);
      } else {
        groupedMap.set(month, [timeline]);
      }
    });

    groupedMap.forEach((timelines, month) => {
      const item = this.buildMonthItem(month, timelines, collector.getPreviousAggregate());
      collector.collectItem(item);
      collector.addToCustomSum("fee", item.fee.value);
      collector.addToCustomSum("tax", item.tax.value);
      collector.addToCustomSum("amount", item.netChanged.value);
      collector.addToCustomSum("profit", item.profit.value);
      collector.updatePreviousAggregate(item.investedAggregate.value, item.investedAggregate.currency);
    });

    return {
      months: collector.getCollectedItems(),
      years: collector.getCollectedYears(),
      fee: this.formatter.monetary({
        value: collector.getCustomSumValue("fee"),
        currency: this.formatter.defaultCurrency,
      }),
      tax: this.formatter.monetary({
        value: collector.getCustomSumValue("tax"),
        currency: this.formatter.defaultCurrency,
      }),
      profit: this.formatter.monetary({
        value: collector.getCustomSumValue("profit"),
        currency: this.formatter.defaultCurrency,
      }),
      amount: this.formatter.monetary({
        value: collector.getCustomSumValue("amount"),
        currency: this.formatter.defaultCurrency,
      }),
    };
  }

  private buildMonthItem(
    month: string,
    timelines: ProcessedEntity.Timeline[],
    previousInvestedAggregate: Monetary
  ): App.Activity.TradingMonth {
    const items: App.Activity.TradingItem[] = [];
    const count = { buy: 0, sell: 0 };
    let buy = 0;
    let sell = 0;
    let fee = 0;
    let tax = 0;
    let profit = 0;
    for (const timeline of timelines) {
      const item = this.buildItem(timeline);
      if (!item) {
        continue;
      }

      if (item.type == "buy") {
        count.buy++;
        buy += item.amount.value;
      } else {
        count.sell++;
        sell += item.amount.value;
      }

      fee += item.fee.value;
      tax += item.tax.value;
      profit += item.profit.netAbsolute.value;
      items.push(item);
    }
    const desc = [];
    const formattedBuy = this.formatter.monetary({ value: buy, currency: this.formatter.defaultCurrency });
    const formattedSell = this.formatter.monetary({ value: sell, currency: this.formatter.defaultCurrency });
    if (count.buy > 0) {
      desc.push(`${getCountString(count.buy, "", "[count] buy", "[count] buys")} total ${formattedBuy.text}`);
    }
    if (count.sell > 0) {
      desc.push(`${getCountString(count.sell, "", "[count] sell", "[count] sells")} total ${formattedSell.text}`);
    }

    return {
      time: month,
      desc: desc.join(", "),
      items: items,
      count: count,
      buy: formattedBuy,
      sell: formattedSell,
      netChanged: this.formatter.monetary({ value: buy + sell, currency: this.formatter.defaultCurrency }),
      fee: this.formatter.monetary({ value: fee, currency: this.formatter.defaultCurrency }),
      tax: this.formatter.monetary({ value: tax, currency: this.formatter.defaultCurrency }),
      profit: this.formatter.monetary({ value: profit, currency: this.formatter.defaultCurrency }),
      investedAggregate: this.formatter.monetary({
        value: previousInvestedAggregate.value + buy + sell,
        currency: this.formatter.defaultCurrency,
      }),
    };
  }

  private buildItem(timeline: ProcessedEntity.Timeline): App.Activity.TradingItem | undefined {
    const transaction = this.transactionService.findTransactionByTimelineId(timeline.id);
    if (!transaction) {
      return undefined;
    }
    let desc = "";
    if (transaction.type == "buy") {
      desc = `Buy ${transaction.instrument.shortName}`;
    } else {
      desc = `Sell ${transaction.instrument.shortName}`;
    }

    return {
      time: this.formatter.datetime(timeline.timestamp),
      timelineId: timeline.id,
      type: transaction.type,
      desc: desc,
      quantity: transaction.quantity,
      amount: this.formatter.monetary(timeline.cashChangeAmount),
      fee: transaction.fee,
      tax: transaction.tax,
      profit: transaction.profit,
    };
  }
}
