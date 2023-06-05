import Dexie from "dexie";

export class TimelineRepository implements Storage.TimelineRepository {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }
  async findById(id: string): Promise<ProcessedEntity.Timeline> {
    return this.db.table(this.tableName).where("id").equals(id).first();
  }

  async saveBulk(timelines: ProcessedEntity.Timeline[]): Promise<void> {
    await this.db.table(this.tableName).bulkPut(timelines);
  }

  getAll(): Promise<ProcessedEntity.Timeline[]> {
    return this.db.table(this.tableName).toArray();
  }

  getByTypes(types: ProcessedEntity.TimelineType[]): Promise<ProcessedEntity.Timeline[]> {
    return this.db.table(this.tableName).where("type").anyOf(types).toArray();
  }

  async each(cb: (item: ProcessedEntity.Timeline) => void): Promise<void> {
    return this.db.table(this.tableName).each(cb);
  }
}
