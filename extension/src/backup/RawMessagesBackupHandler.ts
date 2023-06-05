import md5 from "blueimp-md5";
import StorageFactory from "../storage/StorageFactory";
import { StorageUtil } from "../storage/StorageUtil";
import { sortByTimestampAsc } from "../ui/app/fn/sortByTimestamp";
import { ProcessorManager } from "../processor/ProcessorManager";

const RawMessageTransformer: Backup.Transformer<RawEntity.Message> = {
  fromItem(item: Backup.Item): RawEntity.Message {
    const received = decodeURIComponent(window.escape(window.atob(item.value.received)));
    return {
      id: item.value.id,
      received: received,
      sent: decodeURIComponent(window.escape(window.atob(item.value.sent))),
      locale: item.value.locale,
      type: item.value.type,
      status: item.value.status,
      timestamp: item.value.timestamp,
      month: typeof item.value.month !== "undefined" ? item.value.month : StorageUtil.getMonth(item.value.timestamp),
      date: typeof item.value.date !== "undefined" ? item.value.date : StorageUtil.getDate(item.value.timestamp),
      signature: typeof item.value.signature !== "undefined" ? item.value.signature : md5(item.value.received),
    };
  },

  toItem(input: RawEntity.Message): Backup.Item {
    return {
      type: "raw-message",
      version: 1,
      value: {
        id: input.id,
        received: window.btoa(window.unescape(encodeURIComponent(input.received))),
        sent: window.btoa(window.unescape(encodeURIComponent(input.sent))),
        locale: input.locale,
        type: input.type,
        status: input.status,
        timestamp: input.timestamp,
        month: input.month,
        date: input.date,
        signature: input.signature,
      },
    };
  },

  getItemType(): Backup.ItemType {
    return "raw-message";
  },
};

type Mask = {
  date: string;
};

export default class RawMessagesBackupHandler implements Backup.Handler<RawEntity.Message, Mask> {
  getHandlerName(): string {
    return "raw-message-backup-handler";
  }

  async exportFile(account: Extension.Account, fileMask: Backup.FileMask<Mask>): Promise<Backup.File> {
    const messageRepository = StorageFactory.makeMessageRepository(account);
    const messages = sortByTimestampAsc(await messageRepository.getByDate(fileMask.mask.date));

    return {
      fileName: fileMask.fileName,
      handler: this.getHandlerName(),
      mask: fileMask.mask,
      count: { "raw-message": messages.length },
      items: messages.map((item) => RawMessageTransformer.toItem(item)),
    };
  }

  async importFile(account: Extension.Account, options: Backup.ImportOptions, file: Backup.File): Promise<void> {
    const messages: RawEntity.Message[] = sortByTimestampAsc(
      file.items.map(function (item) {
        return RawMessageTransformer.fromItem(item);
      })
    );

    const processorManager = new ProcessorManager(StorageFactory);
    const messageRepository = StorageFactory.makeMessageRepository(account);

    for (const message of messages) {
      if (message.status == "processed" && !options.reprocessRawMessages) {
        await messageRepository.save(message);
        continue;
      }

      message.status = await processorManager.process(message, account);
      await messageRepository.save(message);
    }
  }

  async migrateAfterRunningImport(account: Extension.Account): Promise<void> {}

  async getFileMasks(account: Extension.Account): Promise<Backup.FileMask<Mask>[]> {
    const messageRepository = StorageFactory.makeMessageRepository(account);
    const dates = await messageRepository.getAllDates();

    return dates.map((date) => {
      return { fileName: `raw-messages-${date}.json`, mask: { date: date } };
    });
  }
}
