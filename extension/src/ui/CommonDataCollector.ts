import DataUtilities from "./app/fn/DataUtilities";

export default class CommonDataCollector<T> {
  private items: T[] = [];
  private years: Set<number> = new Set();
  private total: number = 0;
  private count: number = 0;
  private showedYears: Map<number, boolean> = new Map();
  private medianList: number[] = [];
  private readonly previousAggregate: Entity.Monetary;
  private readonly customMap: Map<string, Map<any, any>> = new Map();
  private readonly customSum: Map<string, { value: number; count: number }> = new Map();

  constructor(
    filteredYears: number[] | undefined,
    previousAggregateCurrency: Currency,
    previousAggregateValue: number = 0
  ) {
    if (typeof filteredYears !== "undefined") {
      filteredYears.forEach((i) => this.showedYears.set(i, true));
    }
    this.previousAggregate = { value: previousAggregateValue, currency: previousAggregateCurrency };
  }

  collectItem(item: T): this {
    this.items.push(item);
    return this;
  }

  addTotal(amount: number, count: number = 1): this {
    this.total += amount;
    this.count += count;

    return this;
  }

  addToCustomSum(name: string, amount: number, count: number = 1): this {
    if (!this.customSum.has(name)) {
      return this;
    }
    const sum = this.customSum.get(name)!;
    sum.value += amount;
    sum.count += count;

    return this;
  }

  defineCustomMap(name: string): this {
    this.customMap.set(name, new Map());

    return this;
  }

  defineCustomSum(name: string): this {
    this.customSum.set(name, { value: 0, count: 0 });

    return this;
  }

  collectToCustomMap<T>(name: string, key: any, collector: (current?: T) => T): this {
    if (!this.customMap.has(name)) {
      return this;
    }
    const map = this.customMap.get(name)!;
    if (!map.has(key)) {
      map.set(key, collector.call(undefined, undefined));
    } else {
      map.set(key, collector.call(undefined, map.get(key)));
    }
    return this;
  }

  updatePreviousAggregate(value: number, currency?: Currency): this {
    this.previousAggregate.value = value;
    if (typeof currency !== "undefined") {
      this.previousAggregate.currency = currency;
    }
    return this;
  }

  addToMedianList(amount: number): this {
    this.medianList.push(amount);

    return this;
  }

  canCollectData(timestamp: Entity.ITimestamp): boolean {
    const date = new Date(timestamp.timestamp);
    const year = date.getFullYear();
    this.years.add(year);
    return !(this.showedYears.size > 0 && !this.showedYears.has(year));
  }

  getCollectedItems(): T[] {
    return this.items;
  }

  getTotal(): number {
    return this.total;
  }

  getCustomSumValue(name: string): number {
    if (this.customSum.has(name)) {
      return this.customSum.get(name)!.value;
    }
    return 0;
  }

  getCustomMap<T>(name: string): Map<any, T> {
    if (this.customMap.has(name)) {
      return this.customMap.get(name)!;
    }
    return new Map();
  }

  getPreviousAggregate(): Entity.Monetary {
    return this.previousAggregate;
  }

  getMedianList(): number[] {
    return this.medianList;
  }

  calculateAverage(): number {
    if (this.count > 0) {
      return this.total / this.count;
    }
    return 0;
  }

  calculateMedian(): number {
    return DataUtilities.calculateMedian(this.medianList);
  }

  getCollectedYears(): number[] {
    return Array.from(this.years).sort(function (a, b) {
      if (a == b) return 0;
      return a < b ? 1 : -1;
    });
  }
}
