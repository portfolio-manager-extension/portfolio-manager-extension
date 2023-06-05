declare namespace App {
  namespace Activity {
    type InterestData = {
      items: InterestItem[];
      years: number[];
      total: FormattedMonetary;
    };

    type InterestItem = {
      id: string;
      time: string;
      month: string;
      desc: string;
      averageBalance: SourcedMonetary;
      interest: string;
      tax: undefined | SourcedMonetary;
      amount: SourcedMonetary;
      taxBase: FormattedMonetary | undefined;
      aggregate: FormattedMonetary;
      previousAggregate: FormattedMonetary;
      timestamp: number;
    };

    interface InterestDataBuilder extends IDataBuilder<InterestData> {
      setTimelines(timelines: ProcessedEntity.Timeline[]): this;
      setInterestDetails(interestDetails: ProcessedEntity.Interest[]): this;
      setCustomInterests(interests: CustomEntity.Interest[]): this;
    }
  }
}
