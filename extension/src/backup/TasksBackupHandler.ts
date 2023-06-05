import UtilityRepository from "../storage/UtilityRepository";

const TaskTransformer: Backup.Transformer<UtilityEntity.Task> = {
  fromItem(item: Backup.Item): UtilityEntity.Task {
    return item.value;
  },

  toItem(input: UtilityEntity.Task): Backup.Item {
    return {
      type: "task",
      version: 1,
      value: input,
    };
  },

  getItemType(): Backup.ItemType {
    return "task";
  },
};

export default class TaskBackupHandler implements Backup.Handler<UtilityEntity.Task, {}> {
  getHandlerName(): string {
    return "task-backup-handler";
  }

  async exportFile(account: Extension.Account, fileMask: Backup.FileMask<{}>): Promise<Backup.File> {
    const repository = new UtilityRepository();
    const tasks = await repository.getAll();

    return {
      fileName: fileMask.fileName,
      handler: this.getHandlerName(),
      mask: fileMask.mask,
      count: { task: tasks.length },
      items: tasks.map(function (task) {
        return TaskTransformer.toItem(task);
      }),
    };
  }

  async importFile(account: Extension.Account, options: Backup.ImportOptions, file: Backup.File): Promise<void> {
    const tasks = file.items.map(function (item) {
      return TaskTransformer.fromItem(item);
    });

    const repository = new UtilityRepository();
    for (const task of tasks) {
      await repository.save(task);
    }
  }

  async migrateAfterRunningImport(account: Extension.Account): Promise<void> {}

  async getFileMasks(account: Extension.Account): Promise<Backup.FileMask<{}>[]> {
    return [{ fileName: "task.json", mask: {} }];
  }
}
