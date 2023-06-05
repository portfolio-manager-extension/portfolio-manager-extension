import { getDefaultFormatter } from "../../../Formatter";
import { sortByTimestampAsc } from "../../../fn/sortByTimestamp";
import CommonDataCollector from "../../../../CommonDataCollector";
import { EMPTY_FORMATTED_MONETARY } from "../../../../../const";

type InstrumentMapItem = { instrument: RawEntity.Instrument; value: number; currency: Currency };
export default class DividendDataBuilder implements App.Activity.DividendDataBuilder {
  private timelines: ProcessedEntity.Timeline[] = [];
  private instruments: RawEntity.Instrument[] = [];
  private locale: Locale = "en";
  private defaultCurrency: Currency = "EUR";
  private groupedType: App.Activity.DividendGroupedType = "none";
  private filteredYears: number[] | undefined = undefined;
  private formatter: App.IFormatter = getDefaultFormatter();

  reset(): this {
    this.timelines = [];
    this.instruments = [];
    this.locale = "en";
    this.defaultCurrency = "EUR";
    this.filteredYears = undefined;
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

  setGroupedType(groupedType: App.Activity.DividendGroupedType): this {
    this.groupedType = groupedType;
    return this;
  }

  setFilteredYears(filteredYears: number[] | undefined): this {
    this.filteredYears = filteredYears;
    return this;
  }

  setInstruments(instruments: RawEntity.Instrument[]): this {
    this.instruments = instruments;
    return this;
  }

  build(): App.Activity.DividendData {
    const collector = new CommonDataCollector<App.Activity.DividendItem>(this.filteredYears, this.defaultCurrency);
    const sortedTimelines = sortByTimestampAsc(this.timelines);
    collector.defineCustomMap("instruments");

    if (this.groupedType == "none") {
      sortedTimelines.forEach((timeline) => {
        if (!collector.canCollectData(timeline)) {
          return;
        }

        const item = this.buildItem(timeline, collector.getPreviousAggregate());
        collector
          .collectItem(item)
          .addTotal(item.amount.value)
          .updatePreviousAggregate(item.aggregate.value, item.aggregate.currency)
          .collectToCustomMap("instruments", item.instrument.id, function (current?: InstrumentMapItem) {
            return {
              instrument: item.instrument,
              value: typeof current !== "undefined" ? current.value + item.amount.value : item.amount.value,
              currency: item.amount.currency,
            };
          });
      });
    } else {
      const groupedMap = new Map<string, ProcessedEntity.Timeline[]>();

      sortedTimelines.forEach((timeline) => {
        if (!collector.canCollectData(timeline)) {
          return;
        }

        const instrument = this.findInstrument(this.formatter.localized(timeline.title));
        collector.collectToCustomMap("instruments", instrument.id, function (current?: InstrumentMapItem) {
          return {
            instrument: instrument,
            value:
              typeof current !== "undefined"
                ? current.value + timeline.cashChangeAmount.value
                : timeline.cashChangeAmount.value,
            currency: timeline.cashChangeAmount.currency,
          };
        });

        const month = this.formatter.month(timeline.timestamp);
        if (groupedMap.has(month)) {
          groupedMap.get(month)!.push(timeline);
        } else {
          groupedMap.set(month, [timeline]);
        }
      });

      groupedMap.forEach((timelines, month) => {
        const item = this.buildGroupedItems(month, collector.getPreviousAggregate(), timelines);

        collector
          .collectItem(item)
          .addTotal(item.amount.value)
          .updatePreviousAggregate(item.aggregate.value, item.aggregate.currency);
      });
    }

    return {
      items: collector.getCollectedItems(),
      instruments: this.formatInstruments(collector.getCustomMap("instruments"), collector.getTotal()),
      groupedType: "none",
      total: this.formatter.monetary({ value: collector.getTotal(), currency: this.defaultCurrency }),
      years: collector.getCollectedYears(),
    };
  }

  formatInstruments(input: Map<string, InstrumentMapItem>, total: number): App.Activity.DividendByInstrument[] {
    const result: App.Activity.DividendByInstrument[] = [];
    for (const [key, item] of input) {
      const percent = total != 0 ? item.value / total : 0;
      result.push({
        instrument: item.instrument,
        amount: this.formatter.monetary({ value: item.value, currency: item.currency }),
        percent: {
          value: percent,
          text: this.formatter.percent(percent),
        },
      });
    }
    return result;
  }

  buildItem(timeline: ProcessedEntity.Timeline, previousAggregate: Entity.Monetary): App.Activity.DividendItem {
    const aggregate = {
      value: previousAggregate.value + timeline.cashChangeAmount.value,
      currency: this.defaultCurrency,
    };

    return {
      instrument: this.findInstrument(this.formatter.localized(timeline.title)),
      time: this.formatter.date(timeline.timestamp),
      desc: this.formatter.localized(timeline.body),
      quantity: NaN,
      taxAndFee: EMPTY_FORMATTED_MONETARY,
      amount: this.formatter.monetary(timeline.cashChangeAmount),
      previousAggregate: this.formatter.monetary(previousAggregate),
      aggregate: this.formatter.monetary(aggregate),
      items: [],
    };
  }

  buildGroupedItems(
    month: string,
    previousAggregate: Entity.Monetary,
    timelines: ProcessedEntity.Timeline[]
  ): App.Activity.DividendItem {
    let amount = 0;
    const items: App.Activity.DividendItem[] = [];
    const instruments: string[] = [];
    timelines.forEach((timeline: ProcessedEntity.Timeline) => {
      amount += timeline.cashChangeAmount.value;
      const item = this.buildItem(timeline, { value: 0, currency: this.defaultCurrency });

      instruments.push(item.instrument.shortName);
      items.push(item);
    });
    const desc = this.formatter.count(
      instruments.length,
      "No dividend",
      "[count] security: " + instruments.join(", "),
      "[count] securities: " + instruments.join(", ")
    );

    const aggregate = { value: amount + previousAggregate.value, currency: this.defaultCurrency };
    return {
      instrument: this.emptyInstrument(),
      time: month,
      desc: desc,
      quantity: NaN,
      taxAndFee: EMPTY_FORMATTED_MONETARY,
      amount: this.formatter.monetary({ value: amount, currency: this.defaultCurrency }),
      previousAggregate: this.formatter.monetary(previousAggregate),
      aggregate: this.formatter.monetary(aggregate),
      items: items,
    };
  }

  findInstrument(name: string): RawEntity.Instrument {
    const instrument = this.instruments.find(function (instrument) {
      return name == instrument.name || name == instrument.shortName;
    });
    if (instrument) {
      return instrument;
    }
    return {
      id: name,
      name: name,
      shortName: name,
      type: "stock",
      country: "",
      splits: [],
    };
  }

  emptyInstrument(): RawEntity.Instrument {
    return {
      id: "",
      name: "",
      shortName: "",
      type: "stock",
      country: null,
      splits: [],
    };
  }
}
