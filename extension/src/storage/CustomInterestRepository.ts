import Dexie from "dexie";

export class CustomInterestRepository implements Storage.CustomInterestRepository {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }

  async findById(id: string): Promise<CustomEntity.Interest | undefined> {
    return this.db.table(this.tableName).where("id").equals(id).first();
  }

  async deleteById(id: string): Promise<void> {
    this.db.table(this.tableName).where("id").equals(id).delete();
  }

  async getAll(): Promise<CustomEntity.Interest[]> {
    return this.db.table(this.tableName).toArray();
  }

  async save(interest: CustomEntity.Interest): Promise<void> {
    await this.db.table(this.tableName).put(interest);
  }
}
