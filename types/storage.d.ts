declare namespace Storage {
  interface ExtensionRepository {
    getSettings(): Promise<Extension.Settings>;
    saveSettings(settings: Extension.Settings): Promise<boolean>;
    createAccount(locale: Locale, currency: Currency, source: Extension.IAccountSource): Promise<Extension.Account>;
    findAccount(source: Extension.IAccountSourceBase): Promise<Extension.Account | undefined>;
    getAccounts(): Promise<Extension.Account[]>;
    saveAccounts(accounts: Extension.Account[]): Promise<boolean>;
  }

  interface StorageFactory {
    makeMessageRepository(account: Extension.Account): MessageRepository;
    makeTimelineRepository(account: Extension.Account): TimelineRepository;
    makeTimelineDetailRepository(account: Extension.Account): TimelineDetailRepository;
    makeQuarterlyBalanceRepository(account: Extension.Account): QuarterlyBalanceRepository;
    makePositionRepository(account: Extension.Account): PositionRepository;
    makeInstrumentRepository(account: Extension.Account): InstrumentRepository;
    makeCustomInterestRepository(account: Extension.Account): CustomInterestRepository;
    makePortfolioRepository(account: Extension.Account): PortfolioRepository;
    makePortfolioInstrumentRepository(account: Extension.Account): Storage.PortfolioInstrumentRepository;
    makeRealtimeTickerRepository(account: Extension.Account): RealtimeTickerRepository;
    makeTickerSnapshotRepository(account: Extension.Account): TickerSnapshotRepository;
    makeDailyCashRepository(account: Extension.Account): DailyDataRepository<ProcessedEntity.DailyCash>;
    makeDailyAvailableCashRepository(
      account: Extension.Account
    ): DailyDataRepository<ProcessedEntity.DailyAvailableCash>;
    makeDailyTaxInformationRepository(
      account: Extension.Account
    ): DailyDataRepository<ProcessedEntity.DailyTaxInformation>;
  }

  interface MessageRepository {
    save(message: RawEntity.Message): Promise<void>;
    updateStatusById(id: string, status: RawEntity.MessageStatus): Promise<void>;
    getAll(): Promise<RawEntity.Message[]>;
    getAllMonths(): Promise<string[]>;
    getByMonth(month: string): Promise<RawEntity.Message[]>;
    getAllDates(): Promise<string[]>;

    getByDate(date: string): Promise<RawEntity.Message[]>;
    getAllStatuses(): Promise<RawEntity.MessageStatus[]>;
    getCountGroupedByStatus(): Promise<Map<RawEntity.MessageStatus, number>>;
    getAllTypes(): Promise<string[]>;
    getCountGroupedByType(): Promise<Map<string, number>>;
    getDuplicateCount(): Promise<number>;
    filter(type: string | undefined, status: RawEntity.MessageStatus | undefined): Promise<RawEntity.Message[]>;
    findById(id: string): Promise<RawEntity.Message | undefined>;
    deleteById(id: string): Promise<void>;
    deleteAllDuplicate(): Promise<void>;
  }

  interface TimelineRepository {
    findById(id: string): Promise<ProcessedEntity.Timeline | undefined>;
    saveBulk(timelines: ProcessedEntity.Timeline[]): Promise<void>;
    getAll(): Promise<ProcessedEntity.Timeline[]>;
    getByTypes(types: ProcessedEntity.TimelineType[]): Promise<ProcessedEntity.Timeline[]>;
    each(cb: (item: ProcessedEntity.Timeline) => void): Promise<void>;
  }

  interface TimelineDetailRepository {
    findById(id: string): Promise<Entity.ITimelineDetail | undefined>;
    save(timelineDetail: Entity.ITimelineDetail): Promise<void>;
    saveBulk(timelineDetails: Entity.ITimelineDetail[]): Promise<void>;
    each(cb: (item: Entity.ITimelineDetail) => void): Promise<void>;
    getAll(): Promise<Entity.ITimelineDetail[]>;
    getByTypes(types: string[]): Promise<Entity.ITimelineDetail[]>;
  }

  interface QuarterlyBalanceRepository {
    saveBulk(balances: ProcessedEntity.QuarterlyBalance[]): Promise<void>;
    getAll(): Promise<ProcessedEntity.QuarterlyBalance[]>;
  }

  interface PositionRepository {
    getAll(): Promise<ProcessedEntity.Position[]>;
    getByStatus(status: ProcessedEntity.PositionStatus): Promise<ProcessedEntity.Position[]>;
    saveBulk(positions: ProcessedEntity.Position[]): Promise<void>;
  }

  interface CustomInterestRepository {
    findById(id: string): Promise<CustomEntity.Interest | undefined>;
    deleteById(id: string): Promise<void>;
    getAll(): Promise<CustomEntity.Interest[]>;
    save(interest: CustomEntity.Interest): Promise<void>;
  }

  interface InstrumentRepository {
    findByISIN(isin: string): Promise<RawEntity.Instrument | undefined>;
    save(instrument: RawEntity.Instrument): Promise<void>;
    saveBulk(instruments: RawEntity.Instrument[]): Promise<void>;
    getAll(): Promise<RawEntity.Instrument[]>;
  }

  interface UtilityRepository {
    getTasksByStatuses(statuses: UtilityEntity.TaskStatus[]): Promise<UtilityEntity.Task[]>;
    getAll(): Promise<UtilityEntity.Task[]>;
    createTask(text: string): Promise<UtilityEntity.Task>;
    deleteTask(id: string): Promise<void>;
    updateTask(task: UtilityEntity.Task): Promise<void>;
    save(task: UtilityEntity.Task): Promise<void>;
  }

  interface TickerSnapshotRepository {
    getAllLatest(): Promise<RawEntity.TickerSnapshot[]>;
    getAllMonths(): Promise<string[]>;
    getAllInstruments(): Promise<string[]>;
    getByMonth(month: string): Promise<RawEntity.TickerSnapshot[]>;
    getByInstrument(instrument: string): Promise<RawEntity.TickerSnapshot[]>;
    save(snapshot: RawEntity.TickerSnapshot): Promise<void>;
    saveBulk(snapshots: RawEntity.TickerSnapshot[]): Promise<void>;
    correctLatest(): Promise<void>;
    findCurrentSnapshot(
      instrumentId: string,
      exchangeId: string,
      timestamp: number
    ): Promise<RawEntity.TickerSnapshot | undefined>;
  }

  interface RealtimeTickerRepository {
    put(entity: ProcessedEntity.RealtimeTicker): void;
    findRealtimeAndConvertToSnapshot(instrumentId: string): RawEntity.TickerSnapshot | undefined;
  }

  interface DailyDataRepository<T extends Entity.IDailyData> {
    getAllMonths(): Promise<string[]>;
    save(item: T): Promise<void>;
    saveBulk(items: T[]): Promise<void>;
    findCurrent(timestamp: number): Promise<T | undefined>;
    findLatest(): Promise<T | undefined>;
  }

  interface PortfolioRepository {
    save(entity: CustomEntity.Portfolio): Promise<void>;
    saveBulk(entities: CustomEntity.Portfolio[]): Promise<void>;
    create(name: string): Promise<CustomEntity.Portfolio>;
    getAll(): Promise<CustomEntity.Portfolio[]>;
    findById(id: string): Promise<CustomEntity.Portfolio | undefined>;
    getAllActive(): Promise<CustomEntity.Portfolio[]>;
    getByStatus(status: "active" | "deleted"): Promise<CustomEntity.Portfolio[]>;
    updateOrder(id: string, order: number): Promise<void>;
    deleteById(id: string): Promise<void>;
  }

  interface PortfolioInstrumentRepository {
    addToPortfolio(portfolioId: string, instrumentId: string): Promise<void>;
    removeFromPortfolio(portfolioId: string, instrumentId: string): Promise<void>;
    updateOrder(id: string, order: number): Promise<void>;
    getByPortfolioId(portfolioId: string): Promise<CustomEntity.PortfolioInstrument[]>;
    getAll(): Promise<CustomEntity.PortfolioInstrument[]>;
    saveBulk(entities: CustomEntity.PortfolioInstrument[]): Promise<void>;
  }
}
