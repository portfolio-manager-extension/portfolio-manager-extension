import { getDefaultFormatter } from "../../../../Formatter";
import ServiceManager from "../../../../../../service/ServiceManager";

export default class ManageInstrumentsDataBuilder implements App.Portfolio.ManageInstrumentsDataBuilder {
  private currentPortfolioId: string = "";
  private portfolios: Map<string, CustomEntity.Portfolio> = new Map();
  private positions: Map<string, ProcessedEntity.Position> = new Map();
  private portfolioInstruments: Map<string, CustomEntity.PortfolioInstrument[]> = new Map();
  private portfolioIdsGroupedByInstruments: Map<string, Set<string>> = new Map();
  private formatter: App.IFormatter = getDefaultFormatter();
  private instruments: RawEntity.Instrument[] = [];
  private instrumentService: Service.InstrumentService = ServiceManager.makeInstrumentService([]);

  reset(): this {
    this.currentPortfolioId = "";
    this.portfolios = new Map();
    this.positions = new Map();
    this.portfolioInstruments = new Map();
    this.portfolioIdsGroupedByInstruments = new Map();
    this.formatter = getDefaultFormatter();
    this.instruments = [];
    this.instrumentService = ServiceManager.makeInstrumentService([]);
    return this;
  }

  setFormatter(formatter: App.IFormatter): this {
    this.formatter = getDefaultFormatter();
    return this;
  }

  setPortfolios(portfolios: CustomEntity.Portfolio[]): this {
    this.portfolios.clear();
    portfolios.forEach((item) => {
      this.portfolios.set(item.id, item);
    });
    return this;
  }

  setPositions(positions: ProcessedEntity.Position[]): this {
    this.positions.clear();
    positions.forEach((item) => {
      if (item.status == "holding") {
        this.positions.set(item.isin, item);
      }
    });
    return this;
  }

  setPortfolioInstruments(portfolioInstruments: CustomEntity.PortfolioInstrument[]): this {
    this.portfolioInstruments.clear();
    portfolioInstruments.forEach((item) => {
      if (this.portfolioInstruments.has(item.portfolioId)) {
        this.portfolioInstruments.get(item.portfolioId)!.push(item);
      } else {
        this.portfolioInstruments.set(item.portfolioId, [item]);
      }
      if (this.portfolioIdsGroupedByInstruments.has(item.instrumentId)) {
        this.portfolioIdsGroupedByInstruments.get(item.instrumentId)!.add(item.portfolioId);
      } else {
        this.portfolioIdsGroupedByInstruments.set(item.instrumentId, new Set([item.portfolioId]));
      }
    });
    return this;
  }

  setInstruments(instruments: RawEntity.Instrument[]): this {
    this.instruments = instruments;
    this.instrumentService = ServiceManager.makeInstrumentService(instruments);
    return this;
  }

  setCurrentPortfolioId(portfolioId: string): this {
    this.currentPortfolioId = portfolioId;
    return this;
  }

  build(): App.Portfolio.ManageInstrumentsData {
    return {
      availableItems: this.getAvailableItems(),
      assignedItems: this.getAssignedItems(),
    };
  }

  getAvailableItems(): App.Portfolio.AvailableInstrumentItem[] {
    const result: App.Portfolio.AvailableInstrumentItem[] = [];
    const assigned = new Map();
    const assignedPortfolioInstruments = this.portfolioInstruments.get(this.currentPortfolioId);
    if (assignedPortfolioInstruments) {
      assignedPortfolioInstruments.forEach((item) => {
        assigned.set(item.instrumentId, item.id);
      });
    }

    this.instruments.forEach((instrument) => {
      if (assigned.has(instrument.id)) {
        return;
      }
      const info = this.instrumentService.findByISIN(instrument.id, true);
      const position = this.positions.get(instrument.id);
      const portfolios = this.portfolioIdsGroupedByInstruments.get(instrument.id);
      let portfolioNames: Set<string> = new Set();
      if (portfolios) {
        portfolios.forEach((id) => {
          const portfolio = this.portfolios.get(id);
          if (portfolio) {
            portfolioNames.add(portfolio.name);
          }
        });
      }
      result.push({
        isin: instrument.id,
        name: info.shortName,
        holding: typeof position !== "undefined",
        holdingSize: typeof position !== "undefined" ? position.netSize : "",
        portfolioNames: Array.from(portfolioNames),
      });
    });
    return result;
  }

  getAssignedItems(): App.Portfolio.AssignedInstrumentItem[] {
    const assignedPortfolioInstruments = this.portfolioInstruments.get(this.currentPortfolioId);
    if (!assignedPortfolioInstruments) {
      return [];
    }

    return assignedPortfolioInstruments
      .map((pp) => {
        let isin = pp.instrumentId;
        const instrument = this.instrumentService.findByISIN(isin, true);
        const position = this.positions.get(isin);
        return {
          id: pp.id,
          isin: pp.instrumentId,
          name: instrument.shortName,
          holding: typeof position !== "undefined",
          holdingSize: typeof position !== "undefined" ? position.netSize : "",
          order: pp.order,
        };
      })
      .sort(function (a, b) {
        if (a.order == b.order) {
          return 0;
        }
        return a.order < b.order ? -1 : 1;
      });
  }
}
