import Dexie from "dexie";

export default class PositionRepository implements Storage.PositionRepository {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }

  getAll(): Promise<ProcessedEntity.Position[]> {
    return this.db.table(this.tableName).toArray();
  }

  getByStatus(status: ProcessedEntity.PositionStatus): Promise<ProcessedEntity.Position[]> {
    return this.db.table(this.tableName).where("status").equals(status).toArray();
  }

  async saveBulk(positions: ProcessedEntity.Position[]): Promise<void> {
    await this.db.table(this.tableName).bulkPut(positions);
  }
}
