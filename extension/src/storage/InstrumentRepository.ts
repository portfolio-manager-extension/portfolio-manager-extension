import Dexie from "dexie";

export default class InstrumentRepository implements Storage.InstrumentRepository {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }

  findByISIN(isin: string): Promise<RawEntity.Instrument | undefined> {
    return this.db.table(this.tableName).where("id").equals(isin).first();
  }

  async save(instrument: RawEntity.Instrument): Promise<void> {
    this.db.table(this.tableName).put(instrument);
  }

  async saveBulk(instruments: RawEntity.Instrument[]): Promise<void> {
    this.db.table(this.tableName).bulkPut(instruments);
  }

  async getAll(): Promise<RawEntity.Instrument[]> {
    return this.db.table(this.tableName).toArray();
  }
}
