declare namespace App {
  namespace YourData {
    type RawMessagesData = {
      items: RawMessageItem[];
      duplicated: number;
      types: Map<string, number>;
      statuses: Map<RawEntity.MessageStatus, number>;
      filteredType: string | undefined;
      filteredStatus: RawEntity.MessageStatus | undefined;
    };

    type RawMessagesDataOptions = {
      filteredType: string | undefined;
      filteredStatus: RawEntity.MessageStatus | undefined;
    };

    interface RawMessageItem {
      id: string;
      time: string;
      content: string;
      locale: string;
      type: string;
      status: RawEntity.MessageStatus;
    }

    interface RawMessagesDataBuilder extends IDataBuilder<RawMessagesData> {
      setMessages(messages: RawEntity.Message[]): this;
      setContentLength(length: number): this;
      setOptions(options: RawMessagesDataOptions): this;
      setTypes(types: Map<string, number>): this;
      setStatuses(statuses: Map<RawEntity.MessageStatus, number>): this;
      setDuplicated(duplicated: number): this;
    }

    interface RawMessagesDataDirector extends IDataDirector<RawMessagesData, RawMessagesDataOptions> {}

    /******************************************************************************************************************/

    type ProcessedDataType = "timeline" | "quarterly-balance";
    type ProcessedDataOptions = {
      filteredMonth: string | undefined;
      filteredType: ProcessedDataType;
    };

    interface ProcessedData {
      items: ProcessedDataItem[];
      months: Map<string, number> | undefined;
      filteredMonth: string | undefined;
      filteredType: ProcessedDataType;
    }

    interface ProcessedDataItem {
      id: string;
      time: string;
      type: string;
      content: string;
    }

    interface ProcessedDataBuilder extends IDataBuilder<ProcessedData> {
      setFilteredMonth(month: string | undefined): this;
      setFilteredType(type: ProcessedDataType): this;
      setContentLength(length: number): this;
    }

    interface ProcessedDataDirector extends IDataDirector<ProcessedData, ProcessedDataOptions> {}
  }
}
