declare namespace App {
  namespace Activity {
    type DividendGroupedType = "none" | "month";

    type DividendData = {
      items: DividendItem[];
      instruments: DividendByInstrument[];
      groupedType: DividendGroupedType;
      total: FormattedMonetary;
      years: number[];
    };

    type DividendDataOptions = {
      groupedType: DividendGroupedType;
      filteredYears: number[] | undefined;
    };

    type DividendItem = {
      instrument: RawEntity.Instrument;
      time: string;
      desc: string;
      quantity: number;
      taxAndFee: FormattedMonetary;
      amount: FormattedMonetary;
      previousAggregate: FormattedMonetary;
      aggregate: FormattedMonetary;
      items: DividendItem[];
    };

    type DividendByInstrument = {
      instrument: RawEntity.Instrument;
      amount: FormattedMonetary;
      percent: { value: number; text: string };
    };

    interface DividendDataBuilder extends IDataBuilder<DividendData> {
      setTimelines(timelines: ProcessedEntity.Timeline[]): this;
      setGroupedType(groupedType: DividendGroupedType): this;
      setFilteredYears(filteredYears: number[] | undefined): this;
      setInstruments(instruments: RawEntity.Instrument[]): this;
    }
    interface DividendDataDirector extends App.IDataDirector<DividendData, DividendDataOptions> {}
  }
}
