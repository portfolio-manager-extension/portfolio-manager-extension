import Dexie from "dexie";
import { StorageUtil } from "./StorageUtil";

export default class DailyDataRepository<T extends Entity.IDailyData> implements Storage.DailyDataRepository<T> {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }

  async findCurrent(timestamp: number): Promise<T | undefined> {
    return this.db.table(this.tableName).where("date").equals(StorageUtil.getDate(timestamp)).first();
  }

  async findLatest(): Promise<T | undefined> {
    // @ts-ignore
    const dates: string[] = await this.db.table(this.tableName).orderBy("date").uniqueKeys();
    if (dates.length == 0) {
      return undefined;
    }

    const date = dates.sort(function (a, b) {
      return b.localeCompare(a);
    })[0];

    return this.db.table(this.tableName).where("date").equals(date).first();
  }

  async getAllMonths(): Promise<string[]> {
    // @ts-ignore
    return this.db.table(this.tableName).orderBy("month").uniqueKeys();
  }

  async save(item: T): Promise<void> {
    await this.db.table(this.tableName).put(item);
  }

  async saveBulk(items: T[]): Promise<void> {
    await this.db.table(this.tableName).bulkPut(items);
  }
}
