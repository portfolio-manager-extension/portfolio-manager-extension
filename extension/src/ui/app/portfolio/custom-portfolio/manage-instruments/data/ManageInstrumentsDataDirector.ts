import Formatter from "../../../../Formatter";

export default class ManageInstrumentsDataDirector implements App.Portfolio.ManageInstrumentsDataDirector {
  private portfolioRepository: Storage.PortfolioRepository;
  private positionRepository: Storage.PositionRepository;
  private instrumentRepository: Storage.InstrumentRepository;
  private builder: App.Portfolio.ManageInstrumentsDataBuilder;
  private portfolioInstrumentRepository: Storage.PortfolioInstrumentRepository;

  constructor(
    portfolioRepository: Storage.PortfolioRepository,
    positionRepository: Storage.PositionRepository,
    instrumentRepository: Storage.InstrumentRepository,
    portfolioInstrumentRepository: Storage.PortfolioInstrumentRepository,
    builder: App.Portfolio.ManageInstrumentsDataBuilder
  ) {
    this.portfolioRepository = portfolioRepository;
    this.positionRepository = positionRepository;
    this.instrumentRepository = instrumentRepository;
    this.portfolioInstrumentRepository = portfolioInstrumentRepository;
    this.builder = builder;
  }
  async make(
    account: Extension.Account,
    options: App.Portfolio.ManageInstrumentsDataOptions
  ): Promise<App.Portfolio.ManageInstrumentsData> {
    return this.builder
      .reset()
      .setFormatter(new Formatter(account.locale, account.defaultCurrency))
      .setPortfolios(await this.portfolioRepository.getAll())
      .setPositions(await this.positionRepository.getAll())
      .setPortfolioInstruments(await this.portfolioInstrumentRepository.getAll())
      .setInstruments(await this.instrumentRepository.getAll())
      .setCurrentPortfolioId(options.portfolioId)
      .build();
  }
}
