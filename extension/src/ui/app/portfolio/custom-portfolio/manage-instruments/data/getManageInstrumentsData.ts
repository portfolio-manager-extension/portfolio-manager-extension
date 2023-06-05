import StorageFactory from "../../../../../../storage/StorageFactory";
import ManageInstrumentsDataDirector from "./ManageInstrumentsDataDirector";
import ManageInstrumentsDataBuilder from "./ManageInstrumentsDataBuilder";

export function getManageInstrumentsData(
  account: Extension.Account,
  options: App.Portfolio.ManageInstrumentsDataOptions
) {
  const director = new ManageInstrumentsDataDirector(
    StorageFactory.makePortfolioRepository(account),
    StorageFactory.makePositionRepository(account),
    StorageFactory.makeInstrumentRepository(account),
    StorageFactory.makePortfolioInstrumentRepository(account),
    new ManageInstrumentsDataBuilder()
  );

  return director.make(account, options);
}

export function getEmptyManageInstrumentsData(): App.Portfolio.ManageInstrumentsData {
  return {
    availableItems: [],
    assignedItems: [],
  };
}
