import Dexie from "dexie";
import { v4 as uuid } from "uuid";

export default class PortfolioRepository implements Storage.PortfolioRepository {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }

  async deleteById(id: string): Promise<void> {
    this.db.table(this.tableName).where("id").equals(id).delete();
  }

  async getAll(): Promise<CustomEntity.Portfolio[]> {
    return this.db.table(this.tableName).toArray();
  }

  async findById(id: string): Promise<CustomEntity.Portfolio | undefined> {
    return this.db.table(this.tableName).where("id").equals(id).first();
  }

  async getAllActive(): Promise<CustomEntity.Portfolio[]> {
    return this.getByStatus("active");
  }

  async getByStatus(status: "active" | "deleted"): Promise<CustomEntity.Portfolio[]> {
    return this.db.table(this.tableName).where("status").equals(status).toArray();
  }

  async updateOrder(id: string, order: number): Promise<void> {
    const exists = await this.db.table(this.tableName).where("id").equals(id).first();
    if (exists) {
      exists.order = order;
      this.db.table(this.tableName).put(exists);
    }
  }

  async save(entity: CustomEntity.Portfolio): Promise<void> {
    await this.db.table(this.tableName).put(entity);
  }

  async saveBulk(entities: CustomEntity.Portfolio[]): Promise<void> {
    await this.db.table(this.tableName).bulkPut(entities);
  }

  async create(name: string): Promise<CustomEntity.Portfolio> {
    const entity: CustomEntity.Portfolio = {
      id: uuid(),
      name: name,
      isDefault: false,
      order: (await this.getCount()) + 1,
      status: "active",
      timestamp: Date.now(),
    };
    await this.save(entity);
    return entity;
  }

  // sometimes there is no table to query, so it will throw an error
  private async getCount(): Promise<number> {
    try {
      return await this.db.table(this.tableName).count();
    } catch (error) {
      return 0;
    }
  }
}
