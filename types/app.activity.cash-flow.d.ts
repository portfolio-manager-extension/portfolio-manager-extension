declare namespace App {
  namespace Activity {
    type CashFlowGroupedType = "none" | "month";

    type CashFlowData = {
      items: CashFlowItem[];
      groupedType: CashFlowGroupedType;
      filteredYears: number[] | undefined;
      years: number[];
      total: FormattedMonetary;
      average: FormattedMonetary;
      median: FormattedMonetary;
    };

    type CashFlowDataOptions = {
      groupedType: CashFlowGroupedType;
      filteredYears: number[] | undefined;
    };

    type CashFlowItem = {
      id: string;
      time: string;
      desc: string;
      deposit: FormattedMonetary;
      withdraw: FormattedMonetary;
      amount: FormattedMonetary;
      aggregate: FormattedMonetary;
      items: CashFlowItem[];
    };

    interface CashFlowDataBuilder extends IDataBuilder<CashFlowData> {
      setTimelines(timelines: ProcessedEntity.Timeline[]): this;
      setGroupedType(groupedType: CashFlowGroupedType): this;
      setFilteredYears(filteredYears: number[] | undefined): this;
    }

    interface CashFlowDataDirector extends App.IDataDirector<CashFlowData, CashFlowDataOptions> {}
  }
}
