import Formatter from "../../../Formatter";

export default class AllPositionsDataDirector implements App.Portfolio.AllPositionsDataDirector {
  private positionRepository: Storage.PositionRepository;
  private instrumentRepository: Storage.InstrumentRepository;
  private tickerSnapshotRepository: Storage.TickerSnapshotRepository;
  private builder: App.Portfolio.AllPositionsDataBuilder;
  private dailyCashRepository: Storage.DailyDataRepository<ProcessedEntity.DailyCash>;
  private portfolioRepository: Storage.PortfolioRepository;
  private portfolioInstrumentRepository: Storage.PortfolioInstrumentRepository;

  constructor(
    positionRepository: Storage.PositionRepository,
    instrumentRepository: Storage.InstrumentRepository,
    tickerSnapshotRepository: Storage.TickerSnapshotRepository,
    dailyCashRepository: Storage.DailyDataRepository<ProcessedEntity.DailyCash>,
    portfolioRepository: Storage.PortfolioRepository,
    portfolioInstrumentRepository: Storage.PortfolioInstrumentRepository,
    builder: App.Portfolio.AllPositionsDataBuilder
  ) {
    this.positionRepository = positionRepository;
    this.instrumentRepository = instrumentRepository;
    this.tickerSnapshotRepository = tickerSnapshotRepository;
    this.dailyCashRepository = dailyCashRepository;
    this.portfolioRepository = portfolioRepository;
    this.portfolioInstrumentRepository = portfolioInstrumentRepository;
    this.builder = builder;
  }

  async make(
    account: Extension.Account,
    options: App.Portfolio.AllPositionsOptions
  ): Promise<App.Portfolio.AllPositionsData> {
    return this.builder
      .reset()
      .setFormatter(new Formatter(account.locale, account.defaultCurrency))
      .setPositions(await this.positionRepository.getByStatus("holding"))
      .setInstruments(await this.instrumentRepository.getAll())
      .setTickerSnapshots(await this.tickerSnapshotRepository.getAllLatest())
      .setDailyCash(await this.dailyCashRepository.findLatest())
      .setPortfolios(await this.portfolioRepository.getAllActive())
      .setPortfolioInstruments(await this.portfolioInstrumentRepository.getAll())
      .setOptions(options)
      .build();
  }
}
