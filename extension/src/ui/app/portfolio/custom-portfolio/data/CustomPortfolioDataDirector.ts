import Formatter from "../../../Formatter";
import ServiceManager from "../../../../../service/ServiceManager";

export default class CustomPortfolioDataDirector implements App.Portfolio.CustomPortfolioDataDirector {
  private positionRepository: Storage.PositionRepository;
  private instrumentRepository: Storage.InstrumentRepository;
  private tickerSnapshotRepository: Storage.TickerSnapshotRepository;
  private builder: App.Portfolio.CustomPortfolioDataBuilder;
  private portfolioInstrumentRepository: Storage.PortfolioInstrumentRepository;

  constructor(
    positionRepository: Storage.PositionRepository,
    instrumentRepository: Storage.InstrumentRepository,
    tickerSnapshotRepository: Storage.TickerSnapshotRepository,
    portfolioInstrumentRepository: Storage.PortfolioInstrumentRepository,
    builder: App.Portfolio.CustomPortfolioDataBuilder
  ) {
    this.positionRepository = positionRepository;
    this.instrumentRepository = instrumentRepository;
    this.tickerSnapshotRepository = tickerSnapshotRepository;
    this.portfolioInstrumentRepository = portfolioInstrumentRepository;
    this.builder = builder;
  }

  async make(
    account: Extension.Account,
    options: App.Portfolio.CustomPortfolioOptions
  ): Promise<App.Portfolio.CustomPortfolioData> {
    return this.builder
      .reset()
      .setFormatter(new Formatter(account.locale, account.defaultCurrency))
      .setPortfolioInstruments(await this.portfolioInstrumentRepository.getByPortfolioId(options.portfolioId))
      .setPositions(await this.positionRepository.getByStatus("holding"))
      .setInstruments(await this.instrumentRepository.getAll())
      .setTickerSnapshots(await this.tickerSnapshotRepository.getAllLatest())
      .setTransactionService(await ServiceManager.getTransactionService(account))
      .build();
  }
}
