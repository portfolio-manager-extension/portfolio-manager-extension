import { RawMessagesDataBuilder } from "./RawMessagesDataBuilder";
import Formatter from "../../../Formatter";

export class RawMessagesDataDirector implements App.YourData.RawMessagesDataDirector {
  private repository: Storage.MessageRepository;
  private builder: RawMessagesDataBuilder;

  constructor(repository: Storage.MessageRepository, builder: RawMessagesDataBuilder) {
    this.repository = repository;
    this.builder = builder;
  }

  async make(
    account: Extension.Account,
    options: App.YourData.RawMessagesDataOptions
  ): Promise<App.YourData.RawMessagesData> {
    return this.builder
      .reset()
      .setFormatter(new Formatter(account.locale, account.defaultCurrency))
      .setMessages(await this.repository.filter(options.filteredType, options.filteredStatus))
      .setContentLength(60)
      .setTypes(await this.repository.getCountGroupedByType())
      .setStatuses(await this.repository.getCountGroupedByStatus())
      .setDuplicated(await this.repository.getDuplicateCount())
      .build();
  }
}
