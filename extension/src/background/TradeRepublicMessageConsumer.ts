import md5 from "blueimp-md5";
import { v4 as uuid } from "uuid";
import { StorageUtil } from "../storage/StorageUtil";

export class TradeRepublicMessageConsumer implements Background.TradeRepublicMessageConsumer {
  private storageFactory: Storage.StorageFactory;
  private processorManager: Processor.Manager;

  constructor(storageFactory: Storage.StorageFactory, processorManager: Processor.Manager) {
    this.storageFactory = storageFactory;
    this.processorManager = processorManager;
  }

  async consume(message: TradeRepublic.FilteredMessage, account: Extension.Account): Promise<void> {
    // if processInstantaneously returns true, it means the message can be skipped and not stored in database.
    if (this.processorManager.processInstantaneously(message, account)) {
      return;
    }

    const timestamp = Date.now();
    const entity: RawEntity.Message = {
      id: uuid(),
      received: message.received,
      sent: message.sent,
      locale: message.locale,
      type: message.type,
      status: "unprocessed",
      timestamp: timestamp,
      month: StorageUtil.getMonth(timestamp),
      date: StorageUtil.getDate(timestamp),
      signature: md5(message.received),
    };

    const messageRepository = this.storageFactory.makeMessageRepository(account);
    await messageRepository.save(entity);

    const status = await this.processorManager.process(entity, account);
    if (status !== "unprocessed") {
      await messageRepository.updateStatusById(entity.id, status);
    }
  }
}
