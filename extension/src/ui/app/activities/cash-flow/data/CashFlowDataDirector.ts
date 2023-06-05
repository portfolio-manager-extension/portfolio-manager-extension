import Formatter from "../../../Formatter";

export default class CashFlowDataDirector implements App.Activity.CashFlowDataDirector {
  private timelineRepository: Storage.TimelineRepository;
  private builder: App.Activity.CashFlowDataBuilder;

  constructor(timelineRepository: Storage.TimelineRepository, builder: App.Activity.CashFlowDataBuilder) {
    this.timelineRepository = timelineRepository;
    this.builder = builder;
  }

  async make(
    account: Extension.Account,
    options: App.Activity.CashFlowDataOptions
  ): Promise<App.Activity.CashFlowData> {
    return this.builder
      .reset()
      .setFormatter(new Formatter(account.locale, account.defaultCurrency))
      .setTimelines(await this.timelineRepository.getByTypes(["deposit", "withdraw"]))
      .setGroupedType(options.groupedType)
      .setFilteredYears(options.filteredYears)
      .build();
  }
}
