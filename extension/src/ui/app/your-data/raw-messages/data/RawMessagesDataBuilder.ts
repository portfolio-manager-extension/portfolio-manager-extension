import { getDefaultFormatter } from "../../../Formatter";
import { sortByTimestampAsc } from "../../../fn/sortByTimestamp";

export class RawMessagesDataBuilder implements App.YourData.RawMessagesDataBuilder {
  private options: App.YourData.RawMessagesDataOptions = {
    filteredStatus: undefined,
    filteredType: undefined,
  };
  private messages: RawEntity.Message[] = [];
  private types: Map<string, number> = new Map();
  private statuses: Map<RawEntity.MessageStatus, number> = new Map();
  private contentLength: number = 100;
  private duplicated: number = 0;
  private formatter: App.IFormatter = getDefaultFormatter();

  reset(): this {
    this.messages = [];
    this.contentLength = 100;
    this.duplicated = 0;
    this.formatter = getDefaultFormatter();
    this.types = new Map();
    this.statuses = new Map();
    return this;
  }

  setFormatter(formatter: App.IFormatter): this {
    this.formatter = formatter;
    return this;
  }

  setMessages(messages: RawEntity.Message[]): this {
    this.messages = messages;
    return this;
  }

  setContentLength(length: number): this {
    if (length < 0) {
      this.contentLength = 100;
    }
    this.contentLength = length;
    return this;
  }

  setOptions(options: App.YourData.RawMessagesDataOptions): this {
    this.options = options;
    return this;
  }

  setTypes(types: Map<string, number>): this {
    this.types = types;
    return this;
  }

  setStatuses(statuses: Map<RawEntity.MessageStatus, number>): this {
    this.statuses = statuses;
    return this;
  }

  setDuplicated(duplicated: number): this {
    this.duplicated = duplicated;
    return this;
  }

  build(): App.YourData.RawMessagesData {
    const items = sortByTimestampAsc(this.messages).map((item) => this.buildItem(item));

    return {
      items: items,
      duplicated: this.duplicated,
      types: this.types,
      statuses: this.statuses,
      filteredType: this.options.filteredType,
      filteredStatus: this.options.filteredStatus,
    };
  }

  buildItem(message: RawEntity.Message): App.YourData.RawMessageItem {
    return {
      id: message.id,
      time: this.formatter.datetime(message.timestamp),
      content: message.received.substring(0, this.contentLength - 3) + "...",
      locale: message.locale,
      type: message.type,
      status: message.status,
    };
  }
}
