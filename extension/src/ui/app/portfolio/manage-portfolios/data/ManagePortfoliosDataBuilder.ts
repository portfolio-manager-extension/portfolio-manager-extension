import { getDefaultFormatter } from "../../../Formatter";

export default class ManagePortfoliosDataBuilder implements App.Portfolio.ManagePortfoliosDataBuilder {
  private activePortfolios: CustomEntity.Portfolio[] = [];
  private portfolios: CustomEntity.Portfolio[] = [];
  private formatter: App.IFormatter = getDefaultFormatter();

  reset(): this {
    this.portfolios = [];
    this.formatter = getDefaultFormatter();
    return this;
  }

  setFormatter(formatter: App.IFormatter): this {
    this.formatter = formatter;
    return this;
  }

  setPortfolios(portfolios: CustomEntity.Portfolio[]): this {
    this.portfolios = portfolios;
    return this;
  }

  setActivePortfolios(portfolios: CustomEntity.Portfolio[]): this {
    this.activePortfolios = portfolios;
    return this;
  }

  build(): App.Portfolio.ManagePortfoliosData {
    return {
      items: this.portfolios
        .sort(function (a, b) {
          if (a.order == b.order) {
            return 0;
          }
          return a.order < b.order ? -1 : 1;
        })
        .map((item, index) => {
          return {
            id: item.id,
            name: item.name,
            order: item.order,
            isDefault: item.status == "active" ? item.isDefault : false,
            status: item.status,
            index: index,
          };
        }),
      active: this.activePortfolios.sort(function (a, b) {
        if (a.order == b.order) {
          return 0;
        }
        return a.order < b.order ? -1 : 1;
      }),
    };
  }
}
