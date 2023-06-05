declare namespace Backup {
  type ItemCount = {
    "raw-message"?: number;
    "custom-interest"?: number;
    task?: number;
    "ticker-snapshot"?: number;
    instrument?: number;
    portfolio?: number;
    "portfolio-instrument"?: number;
  };
  type ItemType = keyof ItemCount;

  type Item = {
    type: ItemType;
    version: number;
    value: any;
  };

  type File = {
    fileName: string;
    handler: string;
    mask: any;
    count: ItemCount;
    items: Item[];
  };

  type FileMask<M> = {
    fileName: string;
    mask: M;
  };

  type Metadata = {
    description: string;
    version: string;
    timestamp: number;
    files: string[];
    count: ItemCount;
    fileMasks: Array<{ fileName: string; mask: any; count: ItemCount }>;
  };

  type CountText = { count: number; text: string; safe: boolean };

  type BackupInfo = {
    errorMessage: string;
    isValid: boolean;
    hasData: boolean;
    metadata: Metadata;
    countTexts: Array<CountText>;
  };

  type FileImportState = {
    file: string;
    state: "wait" | "importing" | "imported";
  };

  type ImportUpdateFn = (state: "start" | "importing" | "done", files: FileImportState[]) => void;

  type Data = {
    items: Item[];
    portfolioManagerExtensionVersion: string;
    timestamp: number;
  };

  interface ImportOptions {
    reprocessRawMessages: boolean;
  }

  interface Transformer<T> {
    getItemType(): ItemType;
    toItem(input: T): Item;
    fromItem(item: Item): T;
  }

  interface Handler<T, M> {
    getHandlerName(): string;
    getFileMasks(account: Extension.Account): Promise<FileMask<M>[]>;
    exportFile(account: Extension.Account, fileMask: FileMask<M>): Promise<File>;
    importFile(account: Extension.Account, options: ImportOptions, file: File): Promise<void>;
    migrateAfterRunningImport(account: Extension.Account): Promise<void>;
  }

  interface Collector<T> {
    getTransformer(): Transformer<T>;
    collect(account: Extension.Account): Promise<Backup.Item[]>;
    store(account: Extension.Account, data: Backup.Item[], options: ImportOptions): Promise<void>;
  }

  interface Manager {
    getCountTexts(account: Extension.Account, count: ItemCount): CountText[];
    getBackupFileMimeType(): string;
    createExportBlob(account: Extension.Account, settings: Extension.Settings): Promise<Blob>;
    parseBackup(account: Extension.Account, file: any): Promise<BackupInfo>;
    importBackup(
      account: Extension.Account,
      options: Backup.ImportOptions,
      file: any,
      updateFn: ImportUpdateFn
    ): Promise<void>;
  }
}
