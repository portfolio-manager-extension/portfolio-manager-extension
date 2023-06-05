declare namespace App {
  interface LoaderData {
    accounts: Extension.Account[];
    settings: Extension.Settings;
  }
  interface AccountPageLoaderData {
    account: Extension.Account;
    settings: Extension.Settings;
    portfolios: CustomEntity.Portfolio[];
    currentPortfolio: CustomEntity.Portfolio | undefined;
    selectedInstrumentId: string | undefined;
  }

  interface ContentPageLoaderData {
    locale: Locale;
    settings: Extension.Settings;
    hasAccount: boolean;
  }

  type FormattedMonetary = {
    value: number;
    text: string;
    currency: Currency;
  };

  type FormattedPercentage = {
    value: number;
    text: string;
  };

  type FormattedValuation = {
    valuation: FormattedMonetary;
    absolute: FormattedMonetary;
    percentage: FormattedPercentage;
    updatedAt: string;
  };

  // Source of data:
  //   - processed: data from log/message which we collected and processed
  //   - inferred: data we calculated based on something, usually processed data
  //   - custom: data come directly from customer input
  // For example: With interest data
  //   - for amount field:
  //     - if it has "processed" source, it comes from timeline-event.
  //   - for averageCash field:
  //     - if it has "inferred" source, it is calculated based on amount (we know the interest is 2% p.a. so we can
  //     calculate average cash based on amount).
  //     - if it has "processed" source, it comes from timeline-event-detail data.
  //     - if it has "custom" source, it comes from customer's input.
  type SourceOfData = "inferred" | "processed" | "custom";
  type SourcedMonetary = FormattedMonetary & { source: SourceOfData };

  interface IFormatter {
    locale: Locale;
    defaultCurrency: Currency;
    localized<T>(input: Localized<T>): T;
    currency(value: number): string;
    monetary(value: Entity.Monetary): FormattedMonetary;
    valuation(
      valuation: Entity.Monetary,
      absolute: Entity.Monetary,
      percentage: Percentage,
      updatedAt: number
    ): FormattedValuation;
    sourcedMonetary(source: App.SourceOfData, input: Entity.Monetary): SourcedMonetary;
    count(value: number, empty: string, singular: string, plural: string): string;
    percent(value: number): string;
    percentage(percentage: { value: number }): FormattedPercentage;
    time(timestamp: number, includeSecond?: boolean): string;
    date(timestamp: number): string;
    month(timestamp: number): string;
    datetime(timestamp: number, includeSecond?: boolean): string;
    relativeTime(timestamp: number): string;
    relativeTime(timestamp: number, scale: string): string;
  }

  interface IDataBuilder<T> {
    reset(): this;
    setFormatter(formatter: IFormatter): this;
    build(): T;
  }

  interface IDataDirector<T, V> {
    make(account: Extension.Account, options: V): Promise<T>;
  }
}
