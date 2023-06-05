import Dexie from "dexie";
import { StorageUtil } from "./StorageUtil";

export class MessageRepository implements Storage.MessageRepository {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }

  async save(message: RawEntity.Message): Promise<void> {
    await this.db.table(this.tableName).put(message);
  }

  async updateStatusById(id: string, status: RawEntity.MessageStatus): Promise<void> {
    const item: RawEntity.Message | undefined = await this.db.table(this.tableName).where("id").equals(id).first();
    if (item) {
      item.status = status;
      this.db.table(this.tableName).put(item);
    }
  }

  async getAll(): Promise<RawEntity.Message[]> {
    return this.db.table(this.tableName).toArray();
  }

  async getAllMonths(): Promise<string[]> {
    // @ts-ignore
    return this.db.table(this.tableName).orderBy("month").uniqueKeys();
  }

  async getAllDates(): Promise<string[]> {
    // @ts-ignore
    const dates: string[] = await this.db.table(this.tableName).orderBy("date").uniqueKeys();
    return dates.sort(function (a, b) {
      return a.localeCompare(b);
    });
  }

  async getAllStatuses(): Promise<RawEntity.MessageStatus[]> {
    // @ts-ignore
    return this.db.table(this.tableName).orderBy("status").uniqueKeys();
  }

  async getCountGroupedByStatus(): Promise<Map<RawEntity.MessageStatus, number>> {
    // @ts-ignore
    const keys: RawEntity.MessageStatus[] = await this.db.table(this.tableName).orderBy("status").keys();
    return StorageUtil.generateCountMap(keys);
  }

  async getAllTypes(): Promise<string[]> {
    // @ts-ignore
    return this.db.table(this.tableName).orderBy("type").uniqueKeys();
  }

  async getCountGroupedByType(): Promise<Map<string, number>> {
    // @ts-ignore
    const keys: RawEntity.MessageStatus[] = await this.db.table(this.tableName).orderBy("type").keys();
    return StorageUtil.generateCountMap(keys);
  }

  async getDuplicateCount(): Promise<number> {
    return this.db.table(this.tableName).where("status").equals("duplicated").count();
  }

  async filter(type: string | undefined, status: RawEntity.MessageStatus | undefined): Promise<RawEntity.Message[]> {
    const filters: any = {};

    if (typeof type !== "undefined") {
      filters["type"] = type;
    }

    if (typeof status !== "undefined") {
      filters["status"] = status;
    }

    // @ts-ignore
    return this.db.table(this.tableName).where(filters).toArray();
  }

  async getByMonth(month: string): Promise<RawEntity.Message[]> {
    return this.db.table(this.tableName).where("month").equals(month).toArray();
  }

  async getByDate(date: string): Promise<RawEntity.Message[]> {
    return this.db.table(this.tableName).where("date").equals(date).toArray();
  }

  async findById(id: string): Promise<RawEntity.Message | undefined> {
    return this.db.table(this.tableName).where("id").equals(id).first();
  }

  async deleteById(id: string): Promise<void> {
    this.db.table(this.tableName).where("id").equals(id).delete();
  }

  async deleteAllDuplicate(): Promise<void> {
    this.db.table(this.tableName).where("status").equals("duplicated").delete();
  }
}
