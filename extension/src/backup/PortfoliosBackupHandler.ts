import StorageFactory from "../storage/StorageFactory";

const PortfolioTransformer: Backup.Transformer<CustomEntity.Portfolio> = {
  fromItem(item: Backup.Item): CustomEntity.Portfolio {
    return item.value;
  },

  toItem(input: CustomEntity.Portfolio): Backup.Item {
    return {
      type: "portfolio",
      version: 1,
      value: input,
    };
  },

  getItemType(): Backup.ItemType {
    return "portfolio";
  },
};

type Mask = {};

export default class PortfoliosBackupHandler implements Backup.Handler<CustomEntity.Portfolio, Mask> {
  getHandlerName(): string {
    return "portfolio-backup-handler";
  }

  async exportFile(account: Extension.Account, fileMask: Backup.FileMask<Mask>): Promise<Backup.File> {
    const repository = StorageFactory.makePortfolioRepository(account);
    const portfolios = await repository.getAll();

    return {
      fileName: fileMask.fileName,
      handler: this.getHandlerName(),
      mask: fileMask.mask,
      count: { portfolio: portfolios.length },
      items: portfolios.map((item) => PortfolioTransformer.toItem(item)),
    };
  }

  async importFile(account: Extension.Account, options: Backup.ImportOptions, file: Backup.File): Promise<void> {
    const portfolios: CustomEntity.Portfolio[] = file.items.map(function (item) {
      return PortfolioTransformer.fromItem(item);
    });

    const repository = StorageFactory.makePortfolioRepository(account);
    await repository.saveBulk(portfolios);
  }

  async migrateAfterRunningImport(account: Extension.Account): Promise<void> {}

  async getFileMasks(account: Extension.Account): Promise<Backup.FileMask<Mask>[]> {
    return [{ fileName: `portfolios.json`, mask: {} }];
  }
}
