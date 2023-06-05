import ManagePortfoliosDataDirector from "./ManagePortfoliosDataDirector";
import StorageFactory from "../../../../../storage/StorageFactory";
import ManagePortfoliosDataBuilder from "./ManagePortfoliosDataBuilder";

export function getManagePortfoliosData(
  account: Extension.Account,
  options: App.Portfolio.ManagePortfoliosOption
): Promise<App.Portfolio.ManagePortfoliosData> {
  const director = new ManagePortfoliosDataDirector(
    StorageFactory.makePortfolioRepository(account),
    new ManagePortfoliosDataBuilder()
  );
  return director.make(account, options);
}

export function getEmptyManagePortfoliosData(): App.Portfolio.ManagePortfoliosData {
  return {
    items: [],
    active: [],
  };
}
