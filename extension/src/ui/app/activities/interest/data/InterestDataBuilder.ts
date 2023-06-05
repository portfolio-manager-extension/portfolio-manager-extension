import { getDefaultFormatter } from "../../../Formatter";
import SourcedMonetary = App.SourcedMonetary;
import { sortByTimestampAsc } from "../../../fn/sortByTimestamp";

const DEFAULT_INTEREST_RATE = 2;

export default class InterestDataBuilder implements App.Activity.InterestDataBuilder {
  private timelines: ProcessedEntity.Timeline[] = [];
  private interestDetails: Map<string, ProcessedEntity.Interest> = new Map();
  private customInterests: Map<string, CustomEntity.Interest> = new Map();
  private locale: Locale = "en";
  private formatter: App.IFormatter = getDefaultFormatter();

  reset(): this {
    this.timelines = [];
    this.interestDetails.clear();
    this.customInterests.clear();
    this.locale = "en";
    this.formatter = getDefaultFormatter();
    return this;
  }

  setFormatter(formatter: App.IFormatter): this {
    this.formatter = formatter;
    return this;
  }

  setTimelines(timelines: ProcessedEntity.Timeline[]): this {
    this.timelines = timelines;
    return this;
  }

  setInterestDetails(interestDetails: ProcessedEntity.Interest[]): this {
    this.interestDetails.clear();
    interestDetails.forEach((item) => this.interestDetails.set(item.id, item));
    return this;
  }

  setCustomInterests(interests: CustomEntity.Interest[]): this {
    this.customInterests.clear();
    interests.forEach((item) => this.customInterests.set(item.id, item));

    return this;
  }

  build(): App.Activity.InterestData {
    const items: App.Activity.InterestItem[] = [];
    const years = new Set<number>();
    const total = { value: 0, currency: "" };
    let previousAggregate = { value: 0, currency: "ANY" };
    sortByTimestampAsc(this.timelines).forEach((timeline) => {
      const item = this.buildItem(timeline, previousAggregate);
      items.push(item);
      previousAggregate = item.aggregate;

      total.value += timeline.cashChangeAmount.value;
      total.currency = timeline.cashChangeAmount.currency;

      const date = new Date(timeline.timestamp);
      return years.add(date.getFullYear());
    });

    const sortedYears = Array.from(years).sort(function (a, b) {
      if (a == b) return 0;
      return a < b ? 1 : -1;
    });

    return { items, years: sortedYears, total: this.formatter.monetary(total) };
  }

  buildItem(timeline: ProcessedEntity.Timeline, previousAggregate: Entity.Monetary): App.Activity.InterestItem {
    const interestDetail = this.interestDetails.get(timeline.id);
    const customInterest = this.customInterests.get(timeline.id);
    const interestRate = 2;
    const aggregate: Entity.Monetary = {
      value: previousAggregate.value + timeline.cashChangeAmount.value,
      currency: timeline.cashChangeAmount.currency,
    };

    return {
      id: timeline.id,
      time: this.formatter.date(timeline.timestamp),
      month: timeline.month,
      desc: this.findLocaleText(timeline.body),
      averageBalance: this.buildAverageCash(timeline, interestDetail, customInterest),
      interest: this.formatter.percent(interestRate / 100),
      tax: this.buildTax(timeline, interestDetail, customInterest),
      previousAggregate: this.formatter.monetary(previousAggregate),
      aggregate: this.formatter.monetary(aggregate),
      amount: this.formatter.sourcedMonetary("processed", timeline.cashChangeAmount),
      timestamp: timeline.timestamp,
      taxBase: !interestDetail ? undefined : this.formatter.monetary(interestDetail.taxBase),
    };
  }

  inferAverageCash(interest: number, rate: number): number {
    // interest = cash * rate / 100 / 12
    // => cash = interest / rate * 100 * 12
    return (interest / rate) * 100 * 12;
  }

  findLocaleText(localizedText: LocalizedText): string {
    if (typeof localizedText[this.locale] != "undefined") {
      return localizedText[this.locale] || "";
    }
    return localizedText.default;
  }

  buildAverageCash(
    timeline: ProcessedEntity.Timeline,
    interestDetail: ProcessedEntity.Interest | undefined,
    customInterest: CustomEntity.Interest | undefined
  ): SourcedMonetary {
    if (customInterest) {
      return this.formatter.sourcedMonetary("custom", customInterest.averageBalance);
    }
    if (interestDetail) {
      return this.formatter.sourcedMonetary("processed", interestDetail.averageBalance);
    }
    const averageCash = this.inferAverageCash(timeline.cashChangeAmount.value, DEFAULT_INTEREST_RATE);
    return {
      value: averageCash,
      text: this.formatter.currency(averageCash),
      source: "inferred",
      currency: timeline.cashChangeAmount.currency,
    };
  }

  buildTax(
    timeline: ProcessedEntity.Timeline,
    interestDetail: ProcessedEntity.Interest | undefined,
    customInterest: CustomEntity.Interest | undefined
  ): SourcedMonetary | undefined {
    if (customInterest) {
      return this.formatter.sourcedMonetary("custom", customInterest.tax.total);
    }
    if (interestDetail) {
      return this.formatter.sourcedMonetary("processed", interestDetail.tax.total);
    }
    return undefined;
  }
}
