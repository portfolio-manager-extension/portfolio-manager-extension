import StorageFactory from "../storage/StorageFactory";

const CustomInterestTransformer: Backup.Transformer<CustomEntity.Interest> = {
  fromItem(item: Backup.Item): CustomEntity.Interest {
    return item.value;
  },

  toItem(input: CustomEntity.Interest): Backup.Item {
    return {
      type: "custom-interest",
      version: 1,
      value: input,
    };
  },

  getItemType(): Backup.ItemType {
    return "custom-interest";
  },
};

export default class CustomInterestBackupHandler implements Backup.Handler<CustomEntity.Interest, {}> {
  getHandlerName(): string {
    return "custom-interest-backup-handler";
  }

  async exportFile(account: Extension.Account, fileMask: Backup.FileMask<{}>): Promise<Backup.File> {
    const repository = StorageFactory.makeCustomInterestRepository(account);
    const interests = await repository.getAll();
    const items = interests.map(function (interest) {
      return CustomInterestTransformer.toItem(interest);
    });

    return {
      fileName: fileMask.fileName,
      handler: this.getHandlerName(),
      mask: fileMask.mask,
      count: { "custom-interest": items.length },
      items: items,
    };
  }

  async importFile(account: Extension.Account, options: Backup.ImportOptions, file: Backup.File): Promise<void> {
    const interests = file.items.map(function (item) {
      return CustomInterestTransformer.fromItem(item);
    });

    const repository = StorageFactory.makeCustomInterestRepository(account);
    for (const interest of interests) {
      await repository.save(interest);
    }
  }

  async migrateAfterRunningImport(account: Extension.Account): Promise<void> {}

  async getFileMasks(account: Extension.Account): Promise<Backup.FileMask<{}>[]> {
    return [{ fileName: "custom-data-interest.json", mask: {} }];
  }
}
