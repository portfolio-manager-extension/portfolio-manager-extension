import { getDefaultFormatter } from "../../../Formatter";

export default class ProcessedDataBuilder implements App.YourData.ProcessedDataBuilder {
  private formatter: App.IFormatter = getDefaultFormatter();
  private contentLength: number = 100;
  private filteredMonth: string | undefined = undefined;
  private filteredType: App.YourData.ProcessedDataType = "timeline";

  reset(): this {
    this.contentLength = 100;
    this.filteredType = "timeline";
    this.filteredMonth = undefined;
    return this;
  }

  setContentLength(length: number): this {
    this.contentLength = length;
    return this;
  }

  setFilteredMonth(month: string | undefined): this {
    this.filteredMonth = month;
    return this;
  }

  setFilteredType(type: App.YourData.ProcessedDataType): this {
    this.filteredType = type;
    return this;
  }

  setFormatter(formatter: App.IFormatter): this {
    this.formatter = formatter;
    return this;
  }

  build(): App.YourData.ProcessedData {
    return {
      items: [],
      months: new Map(),
      filteredMonth: this.filteredMonth,
      filteredType: this.filteredType,
    };
  }
}
