import StorageFactory from "../../../../../storage/StorageFactory";
import DividendDataDirector from "./DividendDataDirector";
import DividendDataBuilder from "./DividendDataBuilder";
import { EMPTY_FORMATTED_MONETARY } from "../../../../../const";

export async function getDividendData(
  account: Extension.Account,
  options: App.Activity.DividendDataOptions
): Promise<App.Activity.DividendData> {
  const director = new DividendDataDirector(
    StorageFactory.makeTimelineRepository(account),
    StorageFactory.makeInstrumentRepository(account),
    new DividendDataBuilder()
  );

  return director.make(account, options);
}

export function getEmptyDividendData(): App.Activity.DividendData {
  return {
    items: [],
    instruments: [],
    groupedType: "none",
    total: EMPTY_FORMATTED_MONETARY,
    years: [],
  };
}
