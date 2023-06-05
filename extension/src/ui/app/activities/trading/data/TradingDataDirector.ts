import Formatter from "../../../Formatter";
import ServiceManager from "../../../../../service/ServiceManager";

export default class TradingDataDirector implements App.Activity.TradingDataDirector {
  private timelineRepository: Storage.TimelineRepository;
  private builder: App.Activity.TradingDataBuilder;

  constructor(timelineRepository: Storage.TimelineRepository, builder: App.Activity.TradingDataBuilder) {
    this.timelineRepository = timelineRepository;
    this.builder = builder;
  }

  async make(account: Extension.Account, options: App.Activity.TradingDataOptions): Promise<App.Activity.TradingData> {
    return this.builder
      .reset()
      .setFormatter(new Formatter(account.locale, account.defaultCurrency))
      .setTimelines(await this.timelineRepository.getByTypes(["buy", "sell", "saving-plan-execute"]))
      .setTransactionService(await ServiceManager.getTransactionService(account))
      .setFilteredYears(options.filteredYears)
      .build();
  }
}
