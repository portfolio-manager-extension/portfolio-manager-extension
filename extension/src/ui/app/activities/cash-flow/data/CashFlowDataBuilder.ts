import { getDefaultFormatter } from "../../../Formatter";
import { sortByTimestampAsc } from "../../../fn/sortByTimestamp";
import Monetary = Entity.Monetary;
import { EMPTY_FORMATTED_MONETARY } from "../../../../../const";
import CommonDataCollector from "../../../../CommonDataCollector";

export default class CashFlowDataBuilder implements App.Activity.CashFlowDataBuilder {
  private timelines: ProcessedEntity.Timeline[] = [];
  private locale: Locale = "en";
  private groupedType: App.Activity.CashFlowGroupedType = "none";
  private filteredYears: number[] | undefined = undefined;
  private defaultCurrency: Currency = "EUR";
  private formatter: App.IFormatter = getDefaultFormatter();

  reset(): this {
    this.timelines = [];
    this.locale = "en";
    this.groupedType = "month";
    this.filteredYears = undefined;
    this.defaultCurrency = "EUR";
    this.formatter = getDefaultFormatter();
    return this;
  }

  setFormatter(formatter: App.IFormatter): this {
    this.formatter = formatter;
    this.defaultCurrency = formatter.defaultCurrency;
    return this;
  }

  setTimelines(timelines: ProcessedEntity.Timeline[]): this {
    this.timelines = timelines;
    return this;
  }

  setGroupedType(groupedType: App.Activity.CashFlowGroupedType): this {
    this.groupedType = groupedType;
    return this;
  }

  setFilteredYears(filteredYears: number[] | undefined): this {
    this.filteredYears = filteredYears;
    return this;
  }

  build(): App.Activity.CashFlowData {
    const commonDataCollector = new CommonDataCollector<App.Activity.CashFlowItem>(
      this.filteredYears,
      this.defaultCurrency
    );
    const sortedTimelines = sortByTimestampAsc(this.timelines);

    if (this.groupedType == "none") {
      sortedTimelines.forEach((timeline) => {
        if (!commonDataCollector.canCollectData(timeline)) {
          return;
        }

        const item = this.buildNoneGroupedItem(timeline, commonDataCollector.getPreviousAggregate());
        commonDataCollector
          .collectItem(item)
          .addTotal(item.amount.value)
          .addToMedianList(item.amount.value)
          .updatePreviousAggregate(item.aggregate.value, item.aggregate.currency);
      });
    } else if (this.groupedType == "month") {
      const groupedMap = new Map<string, ProcessedEntity.Timeline[]>();

      sortedTimelines.forEach((timeline) => {
        if (!commonDataCollector.canCollectData(timeline)) {
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
        const item = this.buildGroupedItems(month, commonDataCollector.getPreviousAggregate(), timelines);

        commonDataCollector
          .collectItem(item)
          .addTotal(item.amount.value)
          .addToMedianList(item.amount.value)
          .updatePreviousAggregate(item.aggregate.value, item.aggregate.currency);
      });
    }

    return {
      items: commonDataCollector.getCollectedItems(),
      groupedType: this.groupedType,
      filteredYears: this.filteredYears,
      years: commonDataCollector.getCollectedYears(),
      total: this.formatter.monetary({
        value: commonDataCollector.getTotal(),
        currency: this.defaultCurrency,
      }),
      average: this.formatter.monetary({
        value: commonDataCollector.calculateAverage(),
        currency: this.defaultCurrency,
      }),
      median: this.formatter.monetary({
        value: commonDataCollector.calculateMedian(),
        currency: this.defaultCurrency,
      }),
    };
  }

  buildNoneGroupedItem(timeline: ProcessedEntity.Timeline, previousAggregate: Monetary): App.Activity.CashFlowItem {
    const amount = this.formatter.monetary(timeline.cashChangeAmount);
    const aggregate: Entity.Monetary = {
      value: previousAggregate.value + amount.value,
      currency: this.defaultCurrency,
    };
    return {
      id: timeline.id,
      time: this.formatter.date(timeline.timestamp),
      desc: this.formatter.localized(timeline.body).replace("\n", " "),
      deposit: timeline.type == "deposit" ? amount : EMPTY_FORMATTED_MONETARY,
      withdraw: timeline.type == "withdraw" ? amount : EMPTY_FORMATTED_MONETARY,
      amount: amount,
      aggregate: this.formatter.monetary(aggregate),
      items: [],
    };
  }

  buildGroupedItems(
    month: string,
    previousAggregate: Monetary,
    timelines: ProcessedEntity.Timeline[]
  ): App.Activity.CashFlowItem {
    let deposit = 0;
    let depositCount = 0;
    let withdraw = 0;
    let withdrawCount = 0;
    const items: App.Activity.CashFlowItem[] = [];
    timelines.forEach((timeline) => {
      if (timeline.type == "deposit") {
        deposit += timeline.cashChangeAmount.value;
        depositCount++;
      } else if (timeline.type == "withdraw") {
        withdraw += timeline.cashChangeAmount.value;
        withdrawCount++;
      }
      items.push(this.buildNoneGroupedItem(timeline, { value: 0, currency: this.defaultCurrency }));
    });

    const desc = [
      this.formatter.count(timelines.length, "", "[count] activity", "[count] activities"),
      ": ",
      this.formatter.count(depositCount, "no deposits", "[count] deposit", "[count] deposits"),
      ", ",
      this.formatter.count(withdrawCount, "no withdrawal", "[count] withdrawal", "[count] withdrawals"),
    ];

    const aggregate: Entity.Monetary = {
      value: previousAggregate.value + deposit + withdraw,
      currency: this.defaultCurrency,
    };
    return {
      id: month,
      time: this.formatter.month(timelines[0].timestamp),
      desc: desc.join(""),
      deposit: this.formatter.monetary({ value: deposit, currency: this.defaultCurrency }),
      withdraw: this.formatter.monetary({ value: withdraw, currency: this.defaultCurrency }),
      amount: this.formatter.monetary({ value: deposit + withdraw, currency: this.defaultCurrency }),
      aggregate: this.formatter.monetary(aggregate),
      items: items,
    };
  }
}
