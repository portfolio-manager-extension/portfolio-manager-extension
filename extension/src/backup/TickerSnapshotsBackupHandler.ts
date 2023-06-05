import StorageFactory from "../storage/StorageFactory";
import { sortByTimestampAsc } from "../ui/app/fn/sortByTimestamp";

const TickerSnapshotTransformer: Backup.Transformer<RawEntity.TickerSnapshot> = {
  fromItem(item: Backup.Item): RawEntity.TickerSnapshot {
    return item.value;
  },

  toItem(input: RawEntity.TickerSnapshot): Backup.Item {
    return {
      type: "ticker-snapshot",
      version: 1,
      value: input,
    };
  },

  getItemType(): Backup.ItemType {
    return "ticker-snapshot";
  },
};

type Mask = {
  month: string;
};

export default class TickerSnapshotsBackupHandler implements Backup.Handler<RawEntity.TickerSnapshot, Mask> {
  getHandlerName(): string {
    return "ticker-snapshot-backup-handler";
  }

  async exportFile(account: Extension.Account, fileMask: Backup.FileMask<Mask>): Promise<Backup.File> {
    const repository = StorageFactory.makeTickerSnapshotRepository(account);
    const snapshots = sortByTimestampAsc(await repository.getByMonth(fileMask.mask.month));

    return {
      fileName: fileMask.fileName,
      handler: this.getHandlerName(),
      mask: fileMask.mask,
      count: { "ticker-snapshot": snapshots.length },
      items: snapshots.map((item) => TickerSnapshotTransformer.toItem(item)),
    };
  }

  async importFile(account: Extension.Account, options: Backup.ImportOptions, file: Backup.File): Promise<void> {
    const snapshots: RawEntity.TickerSnapshot[] = sortByTimestampAsc(
      file.items.map(function (item) {
        return TickerSnapshotTransformer.fromItem(item);
      })
    );

    const repository = StorageFactory.makeTickerSnapshotRepository(account);
    await repository.saveBulk(snapshots);
  }

  async migrateAfterRunningImport(account: Extension.Account): Promise<void> {
    const repository = StorageFactory.makeTickerSnapshotRepository(account);
    await repository.correctLatest();
  }

  async getFileMasks(account: Extension.Account): Promise<Backup.FileMask<Mask>[]> {
    const repository = StorageFactory.makeTickerSnapshotRepository(account);
    const months = await repository.getAllMonths();

    return months.map((month) => {
      return { fileName: `ticker-snapshot-${month}.json`, mask: { month: month } };
    });
  }
}
