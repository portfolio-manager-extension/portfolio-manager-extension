import Dexie from "dexie";
import { v4 as uuid } from "uuid";

export default class PortfolioInstrumentRepository implements Storage.PortfolioInstrumentRepository {
  private account: Extension.Account;
  private db: Dexie;
  private tableName: string;

  constructor(account: Extension.Account, db: Dexie, tableName: string) {
    this.account = account;
    this.db = db;
    this.tableName = tableName;
  }

  async addToPortfolio(portfolioId: string, instrumentId: string): Promise<void> {
    const exists = await this.db
      .table(this.tableName)
      .where({
        portfolioId: portfolioId,
        instrumentId: instrumentId,
      })
      .first();

    if (exists) {
      return;
    }

    const entity: CustomEntity.PortfolioInstrument = {
      id: uuid(),
      portfolioId: portfolioId,
      instrumentId: instrumentId,
      target: {},
      order: (await this.getCount(portfolioId)) + 1,
      timestamp: Date.now(),
    };
    await this.db.table(this.tableName).put(entity);
  }

  async removeFromPortfolio(portfolioId: string, instrumentId: string): Promise<void> {
    const exists = await this.db
      .table(this.tableName)
      .where({
        portfolioId: portfolioId,
        instrumentId: instrumentId,
      })
      .first();

    if (exists) {
      this.db.table(this.tableName).where("id").equals(exists.id).delete();
      const items = await this.db.table(this.tableName).where("portfolioId").equals(portfolioId).toArray();
      const sorted = items
        .sort(function (a, b) {
          if (a.order == b.order) {
            return 0;
          }
          return a.order < b.order ? -1 : 1;
        })
        .map(function (i, index) {
          return Object.assign({}, i, { order: index + 1 });
        });
      await this.saveBulk(sorted);
    }
  }

  async updateOrder(id: string, order: number): Promise<void> {
    const exists = await this.db.table(this.tableName).where("id").equals(id).first();
    if (exists) {
      exists.order = order;
      this.db.table(this.tableName).put(exists);
    }
  }

  async saveBulk(entities: CustomEntity.PortfolioInstrument[]): Promise<void> {
    await this.db.table(this.tableName).bulkPut(entities);
  }

  async getByPortfolioId(portfolioId: string): Promise<CustomEntity.PortfolioInstrument[]> {
    return this.db.table(this.tableName).where("portfolioId").equals(portfolioId).toArray();
  }

  async getAll(): Promise<CustomEntity.PortfolioInstrument[]> {
    return this.db.table(this.tableName).toArray();
  }

  // sometimes there is no table to query, so it will throw an error
  private async getCount(portfolioId: string): Promise<number> {
    try {
      return await this.db.table(this.tableName).where("portfolioId").equals(portfolioId).count();
    } catch (error) {
      return 0;
    }
  }
}
