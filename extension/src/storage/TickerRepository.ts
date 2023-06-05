import Dexie from "dexie";
import { v4 as uuid } from "uuid";
import { StorageUtil } from "./StorageUtil";

const SAVE_TICKER_INTERVAL = 60000;

export default class TickerRepository implements Storage.RealtimeTickerRepository, Storage.TickerSnapshotRepository {
  private realtimeTickers = new Map<string, ProcessedEntity.RealtimeTicker>();
  private saveTickerIntervals = new Map<string, any>();
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }

  put(entity: ProcessedEntity.RealtimeTicker): void {
    if (this.realtimeTickers.has(entity.id)) {
      this.realtimeTickers.set(entity.id, entity);
      return;
    }

    const tickerId = entity.id;
    this.realtimeTickers.set(entity.id, entity);
    this.saveTicker(tickerId);
    this.saveTickerIntervals.set(
      entity.id,
      setInterval(async () => {
        await this.saveTicker(tickerId);
      }, SAVE_TICKER_INTERVAL)
    );
  }

  findRealtimeAndConvertToSnapshot(instrumentId: string): RawEntity.TickerSnapshot | undefined {
    const key = Array.from(this.realtimeTickers.keys()).find(function (id) {
      const parts = id.split(".");
      if (parts.length != 2) {
        return false;
      }

      if (parts[0] == instrumentId) {
        return true;
      }
      return false;
    });

    if (!key) {
      return undefined;
    }

    const realtimeTicker = this.realtimeTickers.get(key);
    if (!realtimeTicker) {
      return undefined;
    }

    const parts = realtimeTicker.id.split(".");
    if (parts.length != 2) {
      return undefined;
    }
    const timestamp = realtimeTicker.last.time;
    return {
      id: uuid(),
      type: "latest",
      instrument: parts[0] + "." + parts[1],
      instrumentId: parts[0],
      exchangeId: parts[1],
      value: realtimeTicker.last.price,
      date: StorageUtil.getDate(timestamp),
      month: StorageUtil.getMonth(timestamp),
      timestamp: timestamp,
    };
  }

  async getAllLatest(): Promise<RawEntity.TickerSnapshot[]> {
    return this.db.table(this.tableName).where("type").equals("latest").toArray();
  }

  async getAllMonths(): Promise<string[]> {
    // @ts-ignore
    return this.db.table(this.tableName).orderBy("month").uniqueKeys();
  }

  async getAllInstruments(): Promise<string[]> {
    // @ts-ignore
    return this.db.table(this.tableName).orderBy("instrument").uniqueKeys();
  }

  async getByMonth(month: string): Promise<RawEntity.TickerSnapshot[]> {
    return this.db.table(this.tableName).where("month").equals(month).toArray();
  }

  async getByInstrument(instrument: string): Promise<RawEntity.TickerSnapshot[]> {
    return this.db.table(this.tableName).where("instrument").equals(instrument).toArray();
  }

  async save(snapshot: RawEntity.TickerSnapshot): Promise<void> {
    await this.db.table(this.tableName).put(snapshot);
  }

  async saveBulk(snapshots: RawEntity.TickerSnapshot[]): Promise<void> {
    await this.db.table(this.tableName).bulkPut(snapshots);
  }

  async correctLatest(): Promise<void> {
    const instruments = await this.getAllInstruments();
    for (const instrument of instruments) {
      const snapshots = (await this.getByInstrument(instrument)).sort(function (a, b) {
        return b.date.localeCompare(a.date);
      });
      if (snapshots.length == 0) {
        continue;
      }

      const needToBeUpdated = [];
      for (let i = 0, l = snapshots.length; i < l; i++) {
        if (i == 0 && snapshots[i].type == "history") {
          needToBeUpdated.push(Object.assign({}, snapshots[i], { type: "latest" }));
          continue;
        }

        if (i != 0 && snapshots[i].type == "latest") {
          needToBeUpdated.push(Object.assign({}, snapshots[i], { type: "history" }));
        }
      }
      if (needToBeUpdated.length > 0) {
        console.debug("Need to update snapshots: ", needToBeUpdated);
        await this.saveBulk(needToBeUpdated);
      }
    }
  }

  async findCurrentSnapshot(
    instrumentId: string,
    exchangeId: string,
    timestamp: number
  ): Promise<RawEntity.TickerSnapshot | undefined> {
    return this.db
      .table(this.tableName)
      .where({
        instrumentId: instrumentId,
        exchangeId: exchangeId,
        date: StorageUtil.getDate(timestamp),
      })
      .first();
  }

  async updateAllLatestToHistory(instrumentId: string, exchangeId: string) {
    const currentLatestItems: RawEntity.TickerSnapshot[] = await this.db
      .table(this.tableName)
      .where({
        instrumentId: instrumentId,
        exchangeId: exchangeId,
        type: "latest",
      })
      .toArray();

    await this.db.table(this.tableName).bulkPut(
      currentLatestItems.map(function (item) {
        return Object.assign({}, item, { type: "history" });
      })
    );
  }

  async saveTicker(tickerId: string): Promise<void> {
    const realtimeTicker = this.realtimeTickers.get(tickerId);
    if (!realtimeTicker) {
      return;
    }
    const parts = realtimeTicker.id.split(".");
    if (parts.length != 2) {
      return;
    }

    const timestamp = realtimeTicker.last.time;
    const current = await this.findCurrentSnapshot(parts[0], parts[1], timestamp);
    if (current) {
      current.value = realtimeTicker.last.price;
      current.month = StorageUtil.getMonth(timestamp);
      current.date = StorageUtil.getDate(timestamp);
      current.timestamp = timestamp;
      current.type = "latest";

      await this.updateAllLatestToHistory(parts[0], parts[1]);
      return this.save(current);
    }

    const snapshot: RawEntity.TickerSnapshot = {
      id: uuid(),
      type: "latest",
      instrument: parts[0] + "." + parts[1],
      instrumentId: parts[0],
      exchangeId: parts[1],
      value: realtimeTicker.last.price,
      date: StorageUtil.getDate(timestamp),
      month: StorageUtil.getMonth(timestamp),
      timestamp: timestamp,
    };

    await this.updateAllLatestToHistory(parts[0], parts[1]);
    console.debug("create snapshot for", parts[0], parts[1], "at", timestamp);
    return this.save(snapshot);
  }
}
