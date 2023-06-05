import Dexie from "dexie";

export class QuarterlyBalanceRepository implements Storage.QuarterlyBalanceRepository {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }

  async saveBulk(balances: ProcessedEntity.QuarterlyBalance[]): Promise<void> {
    await this.db.table(this.tableName).bulkPut(balances);
  }

  getAll(): Promise<ProcessedEntity.QuarterlyBalance[]> {
    return this.db.table(this.tableName).toArray();
  }
}
