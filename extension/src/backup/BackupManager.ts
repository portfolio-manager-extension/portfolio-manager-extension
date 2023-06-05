import TaskBackupHandler from "./TasksBackupHandler";
import RawMessagesBackupHandler from "./RawMessagesBackupHandler";
import CustomInterestBackupHandler from "./CustomInterestBackupHandler";
import Formatter from "../ui/app/Formatter";
import FileImportState = Backup.FileImportState;
import TickerSnapshotsBackupHandler from "./TickerSnapshotsBackupHandler";
import InstrumentsBackupHandler from "./InstrumentsBackupHandler";
import PortfoliosBackupHandler from "./PortfoliosBackupHandler";
import PortfolioInstrumentsBackupHandler from "./PortfolioInstrumentsBackupHandler";

const METADATA_FILE_NAME = "metadata.json";

// https://stuk.github.io/jszip/documentation/api_jszip/generate_async.html
const COMPRESSION_LEVEL = 1; // 1: best speed -> 6: best compression

type ValidateResult = [string | null, Backup.Metadata | null, any];

class backupManager implements Backup.Manager {
  private handlers: Backup.Handler<any, any>[] = [
    // new CustomInterestBackupHandler(),
    new TaskBackupHandler(),
    new RawMessagesBackupHandler(),
    new TickerSnapshotsBackupHandler(),
    new InstrumentsBackupHandler(),
    new PortfoliosBackupHandler(),
    new PortfolioInstrumentsBackupHandler(),
  ];

  getBackupFileMimeType(): string {
    return "application/zip";
  }

  getCountTexts(account: Extension.Account, count: Backup.ItemCount): Backup.CountText[] {
    const formatter = new Formatter(account.locale, "EUR");
    const countTexts: Array<Backup.CountText> = [];
    if (typeof count["raw-message"] !== "undefined" && count["raw-message"] > 0) {
      countTexts.push({
        count: count["raw-message"],
        text: formatter.count(count["raw-message"], "", "[count] raw message", "[count] raw messages"),
        safe: true,
      });
    }
    if (typeof count["instrument"] !== "undefined" && count["instrument"] > 0) {
      countTexts.push({
        count: count["instrument"],
        text: formatter.count(count["instrument"], "", "[count] instrument", "[count] instruments"),
        safe: false,
      });
    }
    if (typeof count["portfolio"] !== "undefined" && count["portfolio"] > 0) {
      countTexts.push({
        count: count["portfolio"],
        text: formatter.count(count["portfolio"], "", "[count] portfolio", "[count] portfolios"),
        safe: false,
      });
    }
    if (typeof count["portfolio-instrument"] !== "undefined" && count["portfolio-instrument"] > 0) {
      countTexts.push({
        count: count["portfolio-instrument"],
        text: formatter.count(
          count["portfolio-instrument"],
          "",
          "[count] portfolio instrument",
          "[count] portfolio instruments"
        ),
        safe: false,
      });
    }
    if (typeof count["ticker-snapshot"] !== "undefined" && count["ticker-snapshot"] > 0) {
      countTexts.push({
        count: count["ticker-snapshot"],
        text: formatter.count(count["ticker-snapshot"], "", "[count] ticker snapshot", "[count] ticker snapshots"),
        safe: false,
      });
    }
    if (typeof count["custom-interest"] !== "undefined" && count["custom-interest"] > 0) {
      countTexts.push({
        count: count["custom-interest"],
        text: formatter.count(
          count["custom-interest"],
          "",
          "[count] custom activity interest data",
          "[count] custom activity interest data"
        ),
        safe: false,
      });
    }
    if (typeof count.task !== "undefined" && count.task > 0) {
      countTexts.push({
        count: count.task,
        text: formatter.count(count.task, "", "[count] task", "[count] tasks"),
        safe: false,
      });
    }
    return countTexts;
  }

  async createExportBlob(account: Extension.Account, settings: Extension.Settings): Promise<Blob> {
    // @ts-ignore
    const zip = new window.JSZip();
    const metadataFiles: string[] = [];
    const metadataCount: any = {};
    const metadataFileMasks: Array<{ fileName: string; mask: any; count: Backup.ItemCount }> = [];

    for (const handler of this.handlers) {
      const fileMasks = await handler.getFileMasks(account);
      for (const fileMask of fileMasks) {
        const fileData = await handler.exportFile(account, fileMask);

        zip.file(fileMask.fileName, JSON.stringify(fileData, null, 2));

        metadataFiles.push(fileMask.fileName);
        for (const name in fileData.count) {
          if (typeof metadataCount[name] === "undefined") {
            // @ts-ignore
            metadataCount[name] = fileData.count[name];
          } else {
            // @ts-ignore
            metadataCount[name] += fileData.count[name];
          }
        }
        metadataFileMasks.push({ fileName: fileData.fileName, mask: fileData.mask, count: fileData.count });
      }
    }

    const metadata: Backup.Metadata = {
      description: "Backup metadata file of Portfolio Manager Extension",
      version: settings.version,
      timestamp: Date.now(),
      files: metadataFiles,
      count: metadataCount,
      fileMasks: metadataFileMasks,
    };
    zip.file(METADATA_FILE_NAME, JSON.stringify(metadata, null, 2));

    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: COMPRESSION_LEVEL },
    });
  }

  async parseBackup(account: Extension.Account, file: any): Promise<Backup.BackupInfo> {
    let emptyMetadata = { description: "", version: "", files: [], fileMasks: [], count: {}, timestamp: 0 };
    const [errorMessage, metadata] = await this.validateBackup(file);
    if (errorMessage != null) {
      return {
        errorMessage: errorMessage,
        isValid: false,
        hasData: false,
        metadata: emptyMetadata,
        countTexts: [],
      };
    }

    const countTexts = this.getCountTexts(account, metadata!.count);
    return {
      errorMessage: "",
      isValid: true,
      hasData: countTexts.length > 0,
      metadata: metadata!,
      countTexts: countTexts,
    };
  }

  async importBackup(
    account: Extension.Account,
    options: Backup.ImportOptions,
    file: any,
    updateFn: Backup.ImportUpdateFn
  ): Promise<void> {
    const [_, metadata, zip] = await this.validateBackup(file);
    if (metadata == null || zip == null) {
      return;
    }
    let fileStates: Backup.FileImportState[] = metadata.files.map((file) => ({ file: file, state: "wait" }));
    updateFn.call(undefined, "start", fileStates);

    for (const fileName of metadata.files) {
      fileStates = fileStates.map(function (currentFile): FileImportState {
        if (currentFile.file == fileName) {
          return { file: currentFile.file, state: "importing" };
        }
        return currentFile;
      });
      updateFn.call(undefined, "importing", fileStates);

      const file = zip.file(fileName);
      if (file != null) {
        try {
          const fileContent = await file.async("string");
          const fileData: Backup.File = JSON.parse(fileContent);
          for (const handler of this.handlers) {
            if (fileData.handler == handler.getHandlerName()) {
              await handler.importFile(account, options, fileData);
            }
          }
        } catch (error) {}
      }

      fileStates = fileStates.map(function (currentFile): FileImportState {
        if (currentFile.file == fileName) {
          return { file: currentFile.file, state: "imported" };
        }
        return currentFile;
      });
      updateFn.call(undefined, "importing", fileStates);
    }

    for (const handler of this.handlers) {
      await handler.migrateAfterRunningImport(account);
    }
    updateFn.call(undefined, "done", fileStates);
  }

  async validateBackup(file: any): Promise<ValidateResult> {
    if (file.type != this.getBackupFileMimeType()) {
      return [`Please choose file with ".zip" extension.`, null, null];
    }
    // @ts-ignore
    const zip = await window.JSZip.loadAsync(file);
    const metadataFile = zip.file(METADATA_FILE_NAME);
    if (metadataFile == null) {
      return ["Invalid backup file.", null, null];
    }
    const metadata = await this.validateMetadata(await metadataFile.async("string"), zip);
    if (metadata == null) {
      return ["Invalid backup file.", null, null];
    }
    return [null, metadata, zip];
  }

  private async validateMetadata(raw: string, zip: any): Promise<Backup.Metadata | null> {
    try {
      const metadata = JSON.parse(raw);
      const requiredFields = ["description", "timestamp", "version", "files", "count", "fileMasks"];
      for (const field of requiredFields) {
        if (typeof metadata[field] === "undefined") {
          return null;
        }
      }
      for (const file in metadata.file) {
        if (zip.file(file) === null) {
          return null;
        }
      }
      return metadata as Backup.Metadata;
    } catch (error) {
      return null;
    }
  }
}

const BackupManager = new backupManager();
export default BackupManager;
