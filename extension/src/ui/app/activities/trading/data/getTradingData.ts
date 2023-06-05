import TradingDataBuilder from "./TradingDataBuilder";
import TradingDataDirector from "./TradingDataDirector";
import StorageFactory from "../../../../../storage/StorageFactory";
import { EMPTY_FORMATTED_MONETARY } from "../../../../../const";

export function getTradingData(
  account: Extension.Account,
  options: App.Activity.TradingDataOptions
): Promise<App.Activity.TradingData> {
  const builder = new TradingDataBuilder();
  const director = new TradingDataDirector(StorageFactory.makeTimelineRepository(account), builder);

  return director.make(account, options);
}

export function getEmptyTradingData(): App.Activity.TradingData {
  return {
    months: [],
    years: [],
    fee: EMPTY_FORMATTED_MONETARY,
    tax: EMPTY_FORMATTED_MONETARY,
    profit: EMPTY_FORMATTED_MONETARY,
    amount: EMPTY_FORMATTED_MONETARY,
  };
}
