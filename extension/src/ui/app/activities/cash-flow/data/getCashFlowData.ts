import StorageFactory from "../../../../../storage/StorageFactory";
import CashFlowDataDirector from "./CashFlowDataDirector";
import CashFlowDataBuilder from "./CashFlowDataBuilder";
import { EMPTY_FORMATTED_MONETARY } from "../../../../../const";

export async function getCashFlowData(
  account: Extension.Account,
  options: App.Activity.CashFlowDataOptions
): Promise<App.Activity.CashFlowData> {
  const director = new CashFlowDataDirector(StorageFactory.makeTimelineRepository(account), new CashFlowDataBuilder());

  return director.make(account, options);
}

export function getEmptyCashFlowData(): App.Activity.CashFlowData {
  return {
    items: [],
    groupedType: "none",
    filteredYears: undefined,
    years: [],
    total: EMPTY_FORMATTED_MONETARY,
    average: EMPTY_FORMATTED_MONETARY,
    median: EMPTY_FORMATTED_MONETARY,
  };
}
