import TradeRepublicMessageParser from "./TradeRepublicMessageParser";
import { v4 as uuid } from "uuid";
import { StorageUtil } from "../storage/StorageUtil";

export default class TradeRepublicPositionsProcessor implements Processor.MessageProcessor<ProcessedEntity.Position[]> {
  private storageFactory: Storage.StorageFactory;

  constructor(storageFactory: Storage.StorageFactory) {
    this.storageFactory = storageFactory;
  }

  match(message: RawEntity.Message, account: Extension.Account): boolean {
    return account.source.type == "trade-republic" && message.type == "positions";
  }

  async store(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<ProcessedEntity.Position[]>,
    deduplicateResult: Processor.DeduplicateResult<ProcessedEntity.Position[]>,
    account: Extension.Account
  ): Promise<RawEntity.MessageStatus> {
    const repository = this.storageFactory.makePositionRepository(account);
    // store flow:
    //  - get all positions in database
    //  - match by ISIN
    //  - if it already in database, just update value
    //  - if it not in database: create new one
    //  - if it not in database anymore: update to "sold"
    const newPositions = new Map<string, ProcessedEntity.Position>();
    const updatedPositions = new Map<string, ProcessedEntity.Position>();
    const positionsInDatabase = this.makeMapByISIN(await repository.getAll());
    for (const position of processResult.data) {
      if (!positionsInDatabase.has(position.isin)) {
        newPositions.set(position.isin, position);
      } else {
        const current = positionsInDatabase.get(position.isin)!;
        // merge all fields except id
        updatedPositions.set(position.isin, Object.assign({}, current, position, { id: current.id }));
        // then remove it out
        positionsInDatabase.delete(position.isin);
      }
    }
    if (newPositions.size > 0) {
      await repository.saveBulk(Array.from(newPositions.values()));
    }
    if (updatedPositions.size > 0) {
      await repository.saveBulk(Array.from(updatedPositions.values()));
    }
    // what left in positionsInDatabase are sold positions
    if (positionsInDatabase.size > 0) {
      await repository.saveBulk(
        Array.from(updatedPositions.values()).map(function (item) {
          item.status = "sold";
          return item;
        })
      );
    }
    console.debug("new positions:", newPositions);
    console.debug("update positions:", updatedPositions);
    console.debug("sold positions:", positionsInDatabase);
    return "processed";
  }

  private makeMapByISIN(positions: ProcessedEntity.Position[]): Map<string, ProcessedEntity.Position> {
    const result = new Map();
    for (const item of positions) {
      result.set(item.isin, item);
    }
    return result;
  }

  async deduplicate(
    message: RawEntity.Message,
    value: Processor.ProcessResult<ProcessedEntity.Position[]>,
    account: Extension.Account
  ): Promise<Processor.DeduplicateResult<ProcessedEntity.Position[]>> {
    return { hasDuplicate: false };
  }

  async process(
    message: RawEntity.Message,
    account: Extension.Account
  ): Promise<Processor.ProcessResult<ProcessedEntity.Position[]>> {
    const input = TradeRepublicMessageParser.parseMessage<{ positions: TradeRepublic.PositionItem[] }>(
      message.received
    );
    if (!input) {
      return { data: [], processed: false, warnings: [] };
    }

    const result: ProcessedEntity.Position[] = [];
    input.positions.forEach((item) => {
      const position: ProcessedEntity.Position = {
        id: uuid(),
        isin: item.instrumentId,
        netSize: item.netSize,
        averageBuyIn: item.averageBuyIn,
        month: StorageUtil.getMonth(message.timestamp),
        date: StorageUtil.getDate(message.timestamp),
        status: "holding",
        timestamp: message.timestamp,
      };
      result.push(position);
    });
    return { data: result, processed: true, warnings: [] };
  }
}
