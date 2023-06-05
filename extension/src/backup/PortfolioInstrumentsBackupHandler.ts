import StorageFactory from "../storage/StorageFactory";

const PortfolioInstrumentTransformer: Backup.Transformer<CustomEntity.PortfolioInstrument> = {
  fromItem(item: Backup.Item): CustomEntity.PortfolioInstrument {
    return item.value;
  },

  toItem(input: CustomEntity.PortfolioInstrument): Backup.Item {
    return {
      type: "portfolio-instrument",
      version: 1,
      value: input,
    };
  },

  getItemType(): Backup.ItemType {
    return "portfolio-instrument";
  },
};

type Mask = {};

export default class PortfolioInstrumentsBackupHandler
  implements Backup.Handler<CustomEntity.PortfolioInstrument, Mask>
{
  getHandlerName(): string {
    return "portfolio-instrument-backup-handler";
  }

  async exportFile(account: Extension.Account, fileMask: Backup.FileMask<Mask>): Promise<Backup.File> {
    const repository = StorageFactory.makePortfolioInstrumentRepository(account);
    const portfolioInstruments = await repository.getAll();

    return {
      fileName: fileMask.fileName,
      handler: this.getHandlerName(),
      mask: fileMask.mask,
      count: { "portfolio-instrument": portfolioInstruments.length },
      items: portfolioInstruments.map((item) => PortfolioInstrumentTransformer.toItem(item)),
    };
  }

  async importFile(account: Extension.Account, options: Backup.ImportOptions, file: Backup.File): Promise<void> {
    const portfolioInstruments: CustomEntity.PortfolioInstrument[] = file.items.map(function (item) {
      return PortfolioInstrumentTransformer.fromItem(item);
    });

    const repository = StorageFactory.makePortfolioInstrumentRepository(account);
    await repository.saveBulk(portfolioInstruments);
  }

  async migrateAfterRunningImport(account: Extension.Account): Promise<void> {}

  async getFileMasks(account: Extension.Account): Promise<Backup.FileMask<Mask>[]> {
    return [{ fileName: `portfolio-instruments.json`, mask: {} }];
  }
}
