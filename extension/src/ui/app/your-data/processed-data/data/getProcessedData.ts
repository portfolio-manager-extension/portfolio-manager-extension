import ProcessedDataBuilder from "./ProcessedDataBuilder";
import ProcessedDataDirector from "./ProcessedDataDirector";
import StorageFactory from "../../../../../storage/StorageFactory";

export async function getProcessedData(
  account: Extension.Account,
  options: App.YourData.ProcessedDataOptions
): Promise<App.YourData.ProcessedData> {
  const builder = new ProcessedDataBuilder();
  const director = new ProcessedDataDirector(StorageFactory, builder);

  return director.make(account, options);
}

export function getEmptyProcessedData(): App.YourData.ProcessedData {
  return {
    items: [],
    filteredType: "timeline",
    filteredMonth: undefined,
    months: undefined,
  };
}
