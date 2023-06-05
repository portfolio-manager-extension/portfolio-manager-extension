export default class ProcessedDataDirector implements App.YourData.ProcessedDataDirector {
  private storageFactory: Storage.StorageFactory;
  private builder: App.YourData.ProcessedDataBuilder;
  constructor(storageFactory: Storage.StorageFactory, builder: App.YourData.ProcessedDataBuilder) {
    this.storageFactory = storageFactory;
    this.builder = builder;
  }

  async make(
    account: Extension.Account,
    options: App.YourData.ProcessedDataOptions
  ): Promise<App.YourData.ProcessedData> {
    return this.builder.reset().setFilteredType(options.filteredType).setFilteredMonth(options.filteredMonth).build();
  }
}
