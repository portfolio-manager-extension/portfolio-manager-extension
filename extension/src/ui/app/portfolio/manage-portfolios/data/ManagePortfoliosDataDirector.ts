export default class ManagePortfoliosDataDirector implements App.Portfolio.ManagePortfolioDataDirector {
  private portfolioRepository: Storage.PortfolioRepository;
  private builder: App.Portfolio.ManagePortfoliosDataBuilder;
  constructor(portfolioRepository: Storage.PortfolioRepository, builder: App.Portfolio.ManagePortfoliosDataBuilder) {
    this.portfolioRepository = portfolioRepository;
    this.builder = builder;
  }

  async make(
    account: Extension.Account,
    options: App.Portfolio.ManagePortfoliosOption
  ): Promise<App.Portfolio.ManagePortfoliosData> {
    const activePortfolios = await this.portfolioRepository.getByStatus("active");
    if (options.showDeleted) {
      return this.builder
        .reset()
        .setActivePortfolios(activePortfolios)
        .setPortfolios(await this.portfolioRepository.getByStatus("deleted"))
        .build();
    }
    return this.builder.reset().setActivePortfolios(activePortfolios).setPortfolios(activePortfolios).build();
  }
}
