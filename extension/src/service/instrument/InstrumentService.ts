const FORMER_NAMES: { [key: string]: string } = {
  US30303M1027: "Facebook",
};

export default class InstrumentService implements Service.InstrumentService {
  private instruments: Map<string, RawEntity.Instrument>;

  constructor(instruments: RawEntity.Instrument[]) {
    this.instruments = new Map();
    instruments.forEach((item) => this.instruments.set(item.id, item));
  }

  findByISIN(isin: string, fillDefault: true): RawEntity.Instrument;
  findByISIN(isin: string, fillDefault: false): RawEntity.Instrument | undefined;
  findByISIN(isin: string, fillDefault: boolean): RawEntity.Instrument | undefined {
    const instrument = this.instruments.get(isin);
    if (instrument) {
      return instrument;
    }
    if (fillDefault) {
      return {
        id: isin,
        name: isin,
        shortName: isin,
        type: "stock",
        country: "",
        splits: [],
      };
    }
    return undefined;
  }

  findByShortName(name: string): RawEntity.Instrument | undefined {
    for (const instrument of this.instruments.values()) {
      if (instrument.shortName == name) {
        return instrument;
      }
    }
    for (const isin in FORMER_NAMES) {
      if (FORMER_NAMES[isin] == name) {
        return this.findByISIN(isin, false);
      }
    }
    return undefined;
  }

  getTimelineTitles(isin: string): string[] {
    const instrument = this.findByISIN(isin, false);
    if (!instrument) {
      return [];
    }
    if (typeof FORMER_NAMES[isin] !== "undefined") {
      return Array.from(new Set([FORMER_NAMES[isin], instrument.shortName]));
    }
    return [instrument.shortName];
  }
}
