export default class Formatter implements App.IFormatter {
  readonly locale: Locale;
  readonly defaultCurrency: Currency;

  constructor(locale: Locale, defaultCurrency: Currency) {
    this.locale = locale;
    this.defaultCurrency = defaultCurrency;
  }

  localized<T>(input: Localized<T>): T {
    if (typeof input[this.locale] != "undefined") {
      return input[this.locale] as T;
    }
    return input.default;
  }

  currency(value: number): string {
    return new Intl.NumberFormat("de", {
      style: "currency",
      currency: this.defaultCurrency,
    }).format(value);
  }

  monetary(input: Entity.Monetary): App.FormattedMonetary {
    return {
      value: input.value,
      text: this.currency(Math.abs(input.value)),
      currency: input.currency,
    };
  }

  valuation(
    valuation: Entity.Monetary,
    absolute: Entity.Monetary,
    percentage: Percentage,
    updatedAt: number
  ): App.FormattedValuation {
    return {
      valuation: this.monetary(valuation),
      absolute: this.monetary(absolute),
      percentage: this.percentage(percentage),
      updatedAt: "",
    };
  }

  sourcedMonetary(source: App.SourceOfData, input: Entity.Monetary): App.SourcedMonetary {
    return {
      source: source,
      value: input.value,
      text: this.currency(input.value),
      currency: input.currency,
    };
  }

  count(value: number, empty: string, singular: string, plural: string): string {
    if (value == 0) {
      return empty;
    }
    if (value < -1 || value > 1) {
      return plural.replace("[count]", value.toString());
    }
    return singular.replace("[count]", value.toString());
  }

  percent(value: number, fractionDigits: number = 2): string {
    return new Intl.NumberFormat("de", {
      style: "percent",
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value);
  }

  percentage(percentage: { value: number }): App.FormattedPercentage {
    return {
      value: percentage.value,
      text: this.percent(Math.abs(percentage.value)),
    };
  }

  time(timestamp: number, includeSecond?: boolean): string {
    const instant = new Date(timestamp);
    const result = [];

    const hours = instant.getHours();
    result.push(hours < 10 ? "0" + hours : hours.toString());

    const minutes = instant.getMinutes();
    result.push(minutes < 10 ? "0" + minutes : minutes.toString());

    if (includeSecond) {
      const seconds = instant.getSeconds();
      result.push(seconds < 10 ? "0" + seconds : seconds.toString());
    }

    return result.join(":");
  }

  date(timestamp: number): string {
    const instant = new Date(timestamp);
    const result = [];

    const date = instant.getDate();
    result.push(date < 10 ? "0" + date : date.toString());

    const month = instant.getMonth() + 1;
    result.push(month < 10 ? "0" + month : month.toString());

    result.push(instant.getFullYear());
    return result.join(".");
  }

  month(timestamp: number): string {
    const instant = new Date(timestamp);
    const result = [];

    const month = instant.getMonth() + 1;
    result.push(month < 10 ? "0" + month : month.toString());

    result.push(instant.getFullYear());
    return result.join(".");
  }

  datetime(timestamp: number, includeSecond?: boolean): string {
    return this.date(timestamp) + " " + this.time(timestamp, includeSecond);
  }

  relativeTime(timestamp: number, scale: string = "auto"): string {
    // @ts-ignore
    const rtf = new Intl.RelativeTimeFormat(this.locale);
    const delta = timestamp - Date.now();
    const seconds = Math.floor(delta / 1000);
    const minutes = Math.round(seconds / 60);
    if ((minutes == 0 && scale == "auto") || scale == "second") {
      return rtf.format(seconds, "second");
    }

    const hours = Math.round(minutes / 60);
    if ((hours == 0 && scale == "auto") || scale == "minute") {
      return rtf.format(minutes, "minute");
    }

    const days = Math.round(hours / 24);
    if ((days == 0 && scale == "auto") || scale == "hour") {
      return rtf.format(hours, "hour");
    }

    const months = Math.round(days / 30);
    if ((months == 0 && scale == "auto") || scale == "day") {
      return rtf.format(days, "day");
    }

    const years = Math.round(days / 365);
    if ((years == 0 && scale == "auto") || scale == "month") {
      return rtf.format(months, "month");
    }
    return rtf.format(years, "year");
  }
}

export function getDefaultFormatter() {
  return new Formatter("en", "EUR");
}
