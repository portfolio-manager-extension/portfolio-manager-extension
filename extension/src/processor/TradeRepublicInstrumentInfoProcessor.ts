import TradeRepublicMessageParser from "./TradeRepublicMessageParser";

export default class TradeRepublicInstrumentInfoProcessor implements Processor.MessageProcessor<RawEntity.Instrument> {
  private storageFactory: Storage.StorageFactory;
  private repository: Storage.InstrumentRepository | undefined;

  constructor(storageFactory: Storage.StorageFactory) {
    this.storageFactory = storageFactory;
  }

  getRepository(account: Extension.Account): Storage.InstrumentRepository {
    if (typeof this.repository === "undefined") {
      this.repository = this.storageFactory.makeInstrumentRepository(account);
    }
    return this.repository;
  }

  match(message: RawEntity.Message, account: Extension.Account): boolean {
    return account.source.type == "trade-republic" && message.type == "instrument-info";
  }

  async store(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<RawEntity.Instrument>,
    deduplicateResult: Processor.DeduplicateResult<RawEntity.Instrument>,
    account: Extension.Account
  ): Promise<RawEntity.MessageStatus> {
    if (deduplicateResult.hasDuplicate) {
      await this.storageFactory.makeMessageRepository(account).deleteById(message.id);
      return "duplicated";
    }
    await this.getRepository(account).save(processResult.data);
    return "processed";
  }

  async deduplicate(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<RawEntity.Instrument>,
    account: Extension.Account
  ): Promise<Processor.DeduplicateResult<RawEntity.Instrument>> {
    const item = await this.getRepository(account).findByISIN(processResult.data.id);
    if (typeof item === "undefined") {
      return { hasDuplicate: false };
    }
    const itemString = JSON.stringify(item);
    const dataString = JSON.stringify(processResult.data);

    return { hasDuplicate: itemString == dataString };
  }

  async process(
    message: RawEntity.Message,
    account: Extension.Account
  ): Promise<Processor.ProcessResult<RawEntity.Instrument>> {
    const input: any = TradeRepublicMessageParser.parseMessage(message.received);
    const instrument: RawEntity.Instrument = {
      id: input.isin,
      name: input.name,
      shortName: input.shortName || input.nextGenName,
      type: input.typeId,
      country: input.company.countryOfOrigin,
      splits: input.splits,
    };
    return { data: instrument, processed: true, warnings: [] };
  }
}
