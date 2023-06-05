import StorageFactory from "../storage/StorageFactory";

const InstrumentTransformer: Backup.Transformer<RawEntity.Instrument> = {
  fromItem(item: Backup.Item): RawEntity.Instrument {
    return item.value;
  },

  toItem(input: RawEntity.Instrument): Backup.Item {
    return {
      type: "instrument",
      version: 1,
      value: input,
    };
  },

  getItemType(): Backup.ItemType {
    return "instrument";
  },
};

type Mask = {};

export default class InstrumentsBackupHandler implements Backup.Handler<RawEntity.Instrument, Mask> {
  getHandlerName(): string {
    return "instrument-backup-handler";
  }

  async exportFile(account: Extension.Account, fileMask: Backup.FileMask<Mask>): Promise<Backup.File> {
    const repository = StorageFactory.makeInstrumentRepository(account);
    const instruments = await repository.getAll();

    return {
      fileName: fileMask.fileName,
      handler: this.getHandlerName(),
      mask: fileMask.mask,
      count: { instrument: instruments.length },
      items: instruments.map((item) => InstrumentTransformer.toItem(item)),
    };
  }

  async importFile(account: Extension.Account, options: Backup.ImportOptions, file: Backup.File): Promise<void> {
    const instruments: RawEntity.Instrument[] = file.items.map(function (item) {
      return InstrumentTransformer.fromItem(item);
    });

    const repository = StorageFactory.makeInstrumentRepository(account);
    await repository.saveBulk(instruments);
  }

  async migrateAfterRunningImport(account: Extension.Account): Promise<void> {}

  async getFileMasks(account: Extension.Account): Promise<Backup.FileMask<Mask>[]> {
    return [{ fileName: `instruments.json`, mask: {} }];
  }
}
