import { EMPTY_FORMATTED_MONETARY } from "../../../../../const";
import StorageFactory from "../../../../../storage/StorageFactory";
import AllPositionsDataDirector from "./AllPositionsDataDirector";
import AllPositionsDataBuilder from "./AllPositionsDataBuilder";

export async function getAllPositionsData(
  account: Extension.Account,
  options: App.Portfolio.AllPositionsOptions
): Promise<App.Portfolio.AllPositionsData> {
  const director = new AllPositionsDataDirector(
    StorageFactory.makePositionRepository(account),
    StorageFactory.makeInstrumentRepository(account),
    StorageFactory.makeTickerSnapshotRepository(account),
    StorageFactory.makeDailyCashRepository(account),
    StorageFactory.makePortfolioRepository(account),
    StorageFactory.makePortfolioInstrumentRepository(account),
    new AllPositionsDataBuilder()
  );

  return director.make(account, options);
}

export function getEmptyAllPositionsData(): App.Portfolio.AllPositionsData {
  return {
    items: [],
    allocated: EMPTY_FORMATTED_MONETARY,
    valuation: EMPTY_FORMATTED_MONETARY,
    performance: {
      absolute: EMPTY_FORMATTED_MONETARY,
      percentage: EMPTY_FORMATTED_MONETARY,
    },
    balance: { cash: EMPTY_FORMATTED_MONETARY, tooltip: { name: "", text: "", desc: "" } },
    sortedBy: "name",
    sortDirection: "asc",
    includeBalance: true,
    lastUpdate: "",
  };
}
