import Formatter from "../../../Formatter";

export default class DividendDataDirector implements App.Activity.DividendDataDirector {
  private timelineRepository: Storage.TimelineRepository;
  private instrumentRepository: Storage.InstrumentRepository;
  private builder: App.Activity.DividendDataBuilder;

  constructor(
    timelineRepository: Storage.TimelineRepository,
    instrumentRepository: Storage.InstrumentRepository,
    builder: App.Activity.DividendDataBuilder
  ) {
    this.timelineRepository = timelineRepository;
    this.instrumentRepository = instrumentRepository;
    this.builder = builder;
  }

  async make(
    account: Extension.Account,
    options: App.Activity.DividendDataOptions
  ): Promise<App.Activity.DividendData> {
    return this.builder
      .reset()
      .setFormatter(new Formatter(account.locale, account.defaultCurrency))
      .setFilteredYears(options.filteredYears)
      .setGroupedType(options.groupedType)
      .setTimelines(await this.timelineRepository.getByTypes(["dividend"]))
      .setInstruments(await this.instrumentRepository.getAll())
      .build();
  }
}
