import Dexie from "dexie";

export default class TimelineDetailRepository implements Storage.TimelineDetailRepository {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }
  async findById(id: string): Promise<Entity.ITimelineDetail> {
    return this.db.table(this.tableName).where("id").equals(id).first();
  }

  async save(timelineDetail: Entity.ITimelineDetail): Promise<void> {
    await this.db.table(this.tableName).put(timelineDetail);
  }

  async saveBulk(timelineDetails: Entity.ITimelineDetail[]): Promise<void> {
    await this.db.table(this.tableName).bulkPut(timelineDetails);
  }

  getAll(): Promise<Entity.ITimelineDetail[]> {
    return this.db.table(this.tableName).toArray();
  }

  getByTypes(types: string[]): Promise<Entity.ITimelineDetail[]> {
    return this.db.table(this.tableName).where("type").anyOf(types).toArray();
  }

  async each(cb: (item: Entity.ITimelineDetail) => void): Promise<void> {
    return this.db.table(this.tableName).each(cb);
  }
}
