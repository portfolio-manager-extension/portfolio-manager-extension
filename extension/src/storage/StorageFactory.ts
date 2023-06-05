import Dexie from "dexie";
import { MessageRepository } from "./MessageRepository";
import { TimelineRepository } from "./TimelineRepository";
import { QuarterlyBalanceRepository } from "./QuarterlyBalanceRepository";
import { CustomInterestRepository } from "./CustomInterestRepository";
import PositionRepository from "./PositionRepository";
import InstrumentRepository from "./InstrumentRepository";
import TickerRepository from "./TickerRepository";
import PortfolioRepository from "./PortfolioRepository";
import DailyDataRepository from "./DailyDataRepository";
import TimelineDetailRepository from "./TimelineDetailRepository";
import PortfolioInstrumentRepository from "./PortfolioInstrumentRepository";

const INPUT_DB_PREFIX = "input";
const INPUT_DB_VERSION = 1;
const MESSAGES_TABLE = "messages";
const TICKER_SNAPSHOT_TABLE = "ticker_snapshots";
const INSTRUMENT_TABLE = "instruments";

const PROCESSED_DB_PREFIX = "processed";
const PROCESSED_DB_VERSION = 3;
const TIMELINE_TABLE = "timelines";
const TIMELINE_DETAIL_TABLE = "timeline_details";
const QUARTERLY_BALANCE_TABLE = "quarterly_balances";
const POSITION_TABLE = "positions";
const DAILY_CASH_TABLE = "daily_cashes";
const DAILY_AVAILABLE_CASH_TABLE = "daily_available_cashes";
const DAILY_TAX_INFORMATION_TABLE = "daily_tax_information";

const CUSTOM_DB_PREFIX = "custom";
const CUSTOM_DB_VERSION = 3;
const CUSTOM_TIMELINE_DETAILS_TABLE = "timeline_details";
const CUSTOM_PORTFOLIO_TABLE = "portfolios";
const CUSTOM_PORTFOLIO_INSTRUMENT_TABLE = "portfolio_instruments";

class storageFactory implements Storage.StorageFactory {
  private inputDatabases: Map<string, Dexie>;
  private processedDatabases: Map<string, Dexie>;
  private customDatabases: Map<string, Dexie>;
  private realtimeTickerRepositories: Map<string, TickerRepository>;

  constructor() {
    this.inputDatabases = new Map();
    this.processedDatabases = new Map();
    this.customDatabases = new Map();
    this.realtimeTickerRepositories = new Map();
  }

  private makeInputDatabase(account: Extension.Account): Dexie {
    const name = this.getDbName(INPUT_DB_PREFIX, account);
    if (this.inputDatabases.has(name)) {
      return this.inputDatabases.get(name) as Dexie;
    }

    const db = new Dexie(name);
    db.version(INPUT_DB_VERSION).stores({
      [MESSAGES_TABLE]: "id, type, status, month, date, signature",
      [TICKER_SNAPSHOT_TABLE]: "id, type, instrument, instrumentId, exchangeId, month, date",
      [INSTRUMENT_TABLE]: "id, type",
    });
    this.inputDatabases.set(name, db);
    return db;
  }

  private makeProcessedDatabase(account: Extension.Account): Dexie {
    const name = this.getDbName(PROCESSED_DB_PREFIX, account);
    if (this.processedDatabases.has(name)) {
      return this.processedDatabases.get(name) as Dexie;
    }

    const db = new Dexie(name);
    db.version(PROCESSED_DB_VERSION).stores({
      [TIMELINE_TABLE]: "id, messageId, type, month",
      [TIMELINE_DETAIL_TABLE]: "id, type",
      [QUARTERLY_BALANCE_TABLE]: "id, messageId",
      [POSITION_TABLE]: "id, isin, status, month, date",
      [DAILY_CASH_TABLE]: "id, month, date",
      [DAILY_AVAILABLE_CASH_TABLE]: "id, month, date",
      [DAILY_TAX_INFORMATION_TABLE]: "id, month, date",
    });
    this.processedDatabases.set(name, db);
    return db;
  }

  private makeCustomDatabase(account: Extension.Account): Dexie {
    const name = this.getDbName(CUSTOM_DB_PREFIX, account);
    if (this.customDatabases.has(name)) {
      return this.customDatabases.get(name) as Dexie;
    }

    const db = new Dexie(name);
    db.version(CUSTOM_DB_VERSION).stores({
      [CUSTOM_TIMELINE_DETAILS_TABLE]: "id, type",
      [CUSTOM_PORTFOLIO_TABLE]: "id, status",
      [CUSTOM_PORTFOLIO_INSTRUMENT_TABLE]: "id, portfolioId, instrumentId",
    });
    this.customDatabases.set(name, db);
    return db;
  }

  private getDbName(prefix: string, account: Extension.Account): string {
    const parts = [prefix];
    if (account.source.type == "trade-republic") {
      parts.push("tr");
    }
    parts.push(account.source.id);
    return parts.join("_");
  }

  makeMessageRepository(account: Extension.Account): Storage.MessageRepository {
    return new MessageRepository(account, this.makeInputDatabase(account), MESSAGES_TABLE);
  }

  makeTimelineRepository(account: Extension.Account): Storage.TimelineRepository {
    return new TimelineRepository(account, this.makeProcessedDatabase(account), TIMELINE_TABLE);
  }

  makeTimelineDetailRepository(account: Extension.Account): Storage.TimelineDetailRepository {
    return new TimelineDetailRepository(account, this.makeProcessedDatabase(account), TIMELINE_DETAIL_TABLE);
  }

  makeQuarterlyBalanceRepository(account: Extension.Account): Storage.QuarterlyBalanceRepository {
    return new QuarterlyBalanceRepository(account, this.makeProcessedDatabase(account), QUARTERLY_BALANCE_TABLE);
  }

  makePositionRepository(account: Extension.Account): Storage.PositionRepository {
    return new PositionRepository(account, this.makeProcessedDatabase(account), POSITION_TABLE);
  }

  makeInstrumentRepository(account: Extension.Account): Storage.InstrumentRepository {
    return new InstrumentRepository(account, this.makeInputDatabase(account), INSTRUMENT_TABLE);
  }

  makeCustomInterestRepository(account: Extension.Account): Storage.CustomInterestRepository {
    return new CustomInterestRepository(account, this.makeCustomDatabase(account), CUSTOM_TIMELINE_DETAILS_TABLE);
  }

  makePortfolioRepository(account: Extension.Account): Storage.PortfolioRepository {
    return new PortfolioRepository(account, this.makeCustomDatabase(account), CUSTOM_PORTFOLIO_TABLE);
  }

  makePortfolioInstrumentRepository(account: Extension.Account): Storage.PortfolioInstrumentRepository {
    return new PortfolioInstrumentRepository(
      account,
      this.makeCustomDatabase(account),
      CUSTOM_PORTFOLIO_INSTRUMENT_TABLE
    );
  }

  makeRealtimeTickerRepository(account: Extension.Account): TickerRepository {
    const key = account.source.type + ":" + account.source.id;
    if (this.realtimeTickerRepositories.has(key)) {
      return this.realtimeTickerRepositories.get(key)!;
    }
    const repository = new TickerRepository(account, this.makeInputDatabase(account), TICKER_SNAPSHOT_TABLE);
    this.realtimeTickerRepositories.set(key, repository);
    return repository;
  }

  makeTickerSnapshotRepository(account: Extension.Account): TickerRepository {
    return this.makeRealtimeTickerRepository(account);
  }

  makeDailyCashRepository(account: Extension.Account): Storage.DailyDataRepository<ProcessedEntity.DailyCash> {
    return new DailyDataRepository(account, this.makeProcessedDatabase(account), DAILY_CASH_TABLE);
  }

  makeDailyAvailableCashRepository(
    account: Extension.Account
  ): Storage.DailyDataRepository<ProcessedEntity.DailyAvailableCash> {
    return new DailyDataRepository(account, this.makeProcessedDatabase(account), DAILY_AVAILABLE_CASH_TABLE);
  }

  makeDailyTaxInformationRepository(
    account: Extension.Account
  ): Storage.DailyDataRepository<ProcessedEntity.DailyTaxInformation> {
    return new DailyDataRepository(account, this.makeProcessedDatabase(account), DAILY_TAX_INFORMATION_TABLE);
  }
}

const StorageFactory = new storageFactory();
export default StorageFactory;
