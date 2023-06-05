declare namespace App {
  namespace Portfolio {
    type ManagePortfoliosData = {
      items: ManagePortfoliosItem[];
      active: CustomEntity.Portfolio[];
    };

    type ManagePortfoliosItem = {
      id: string;
      name: string;
      order: number;
      index: number;
      isDefault: boolean;
      status: "active" | "deleted";
    };

    type ManagePortfoliosOption = {
      showDeleted: boolean;
    };

    interface ManagePortfoliosDataBuilder extends IDataBuilder<ManagePortfoliosData> {
      setPortfolios(portfolios: CustomEntity.Portfolio[]): this;
      setActivePortfolios(portfolios: CustomEntity.Portfolio[]): this;
    }

    interface ManagePortfolioDataDirector extends IDataDirector<ManagePortfoliosData, ManagePortfoliosOption> {}
  }
}
