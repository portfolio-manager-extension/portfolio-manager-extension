import Formatter from "../../../Formatter";

export default class InterestDataDirector implements App.IDataDirector<App.Activity.InterestData, undefined> {
  private timelineRepository: Storage.TimelineRepository;
  private timelineDetailRepository: Storage.TimelineDetailRepository;
  private customInterestRepository: Storage.CustomInterestRepository;
  private builder: App.Activity.InterestDataBuilder;

  constructor(
    timelineRepository: Storage.TimelineRepository,
    timelineDetailRepository: Storage.TimelineDetailRepository,
    customInterestRepository: Storage.CustomInterestRepository,
    builder: App.Activity.InterestDataBuilder
  ) {
    this.timelineRepository = timelineRepository;
    this.timelineDetailRepository = timelineDetailRepository;
    this.customInterestRepository = customInterestRepository;
    this.builder = builder;
  }

  async make(account: Extension.Account): Promise<App.Activity.InterestData> {
    return this.builder
      .reset()
      .setFormatter(new Formatter(account.locale, account.defaultCurrency))
      .setTimelines(await this.timelineRepository.getByTypes(["interest"]))
      .setInterestDetails((await this.timelineDetailRepository.getByTypes(["interest"])) as ProcessedEntity.Interest[])
      .setCustomInterests(await this.customInterestRepository.getAll())
      .build();
  }
}
