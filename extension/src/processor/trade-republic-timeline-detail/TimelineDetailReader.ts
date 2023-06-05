export default abstract class TimelineDetailReader<T> {
  protected message: RawEntity.Message;
  protected input: TradeRepublic.TimelineDetail;
  protected triggerWarning: boolean = false;

  constructor(message: RawEntity.Message, input: TradeRepublic.TimelineDetail) {
    this.message = message;
    this.input = input;
  }

  abstract read(): T | undefined;

  hasWarnings(): boolean {
    return this.triggerWarning;
  }

  getWarnings(): Processor.ProcessWarning[] {
    if (this.triggerWarning) {
      return [
        {
          messageId: this.message.id,
          dataId: this.input.id,
          input: this.input,
          output: null,
          reason: "unknown-data",
          message: "Data is unknown",
        },
      ];
    }
    return [];
  }

  debug(printSectionData: boolean = true) {
    console.debug("--- timeline-detail ---");
    console.debug("message", this.message, "input", this.input);
    console.debug("locale:", this.message.locale);
    console.debug("signature:", this.getSectionSignature());
    if (!printSectionData) {
      return;
    }

    for (const section of this.input.sections) {
      if (!Array.isArray(section.data)) {
        continue;
      }

      for (const data of section.data) {
        let triggered = false;
        this.triggerIfDetailIsText(data, (detail) => {
          console.debug(JSON.stringify([section.title, data.title]), " is text:", detail);
          triggered = true;
        });
        this.triggerIfDetailIsDecimal(data, (detail) => {
          console.debug(JSON.stringify([section.title, data.title]), " is decimal:", detail);
          triggered = true;
        });
        this.triggerIfDetailIsCurrency(data, (detail) => {
          console.debug(JSON.stringify([section.title, data.title]), " is currency:", detail);
          triggered = true;
        });

        if (!triggered) {
          console.debug(JSON.stringify([section.title, data.title]), " has unknown detail:", data);
          triggered = true;
        }
      }
    }
  }

  protected getSectionSignature() {
    const sections = this.input.sections.map((i) => i.title);
    return sections.join(" > ");
  }

  private findSection(section: string): TradeRepublic.TimelineDetailSection | undefined {
    return this.input.sections.find(function (item) {
      return item.title.toLowerCase() == section.toLowerCase();
    });
  }

  private findDetail(
    section: TradeRepublic.TimelineDetailSection,
    detail: string
  ): TradeRepublic.TimelineDetailSectionDataItem | undefined {
    return section.data.find(function (item) {
      return item.title.toLowerCase() == detail.toLowerCase();
    });
  }

  private triggerIfDetailIsText(
    result: TradeRepublic.TimelineDetailSectionDataItem | undefined,
    continuer: (data: TradeRepublic.DetailTypeText) => void
  ) {
    if (typeof result !== "undefined" && typeof result.detail !== "undefined") {
      const detail = result.detail;
      if (typeof detail.type === "undefined" || detail.type !== "text") {
        return;
      }

      if (typeof detail["text"] !== "undefined") {
        continuer.call(undefined, detail);
      }
    }
  }

  readText(section: string, detail: string, continuer: (data: TradeRepublic.DetailTypeText) => void): this {
    const matched = this.findSection(section);
    if (matched) {
      this.triggerIfDetailIsText(this.findDetail(matched, detail), continuer);
    }
    return this;
  }

  private triggerIfDetailIsDecimal(
    result: TradeRepublic.TimelineDetailSectionDataItem | undefined,
    continuer: (data: TradeRepublic.DetailTypeDecimal) => void
  ) {
    if (typeof result !== "undefined" && typeof result.detail !== "undefined") {
      const detail = result.detail;
      if (typeof detail.type === "undefined" || detail.type !== "decimal") {
        return this;
      }

      if (typeof detail["value"] !== "undefined" && typeof detail["fractionDigits"] !== "undefined") {
        continuer.call(undefined, detail);
      }
    }
  }

  readDecimal(section: string, detail: string, continuer: (data: TradeRepublic.DetailTypeDecimal) => void): this {
    const matched = this.findSection(section);
    if (matched) {
      this.triggerIfDetailIsDecimal(this.findDetail(matched, detail), continuer);
    }
    return this;
  }

  private triggerIfDetailIsPercentage(
    result: TradeRepublic.TimelineDetailSectionDataItem | undefined,
    continuer: (data: TradeRepublic.DetailTypePercentage) => void
  ) {
    if (typeof result !== "undefined" && typeof result.detail !== "undefined") {
      const detail = result.detail;
      if (typeof detail.type === "undefined" || detail.type !== "percentage") {
        return this;
      }

      if (typeof detail["value"] !== "undefined" && typeof detail["fractionDigits"] !== "undefined") {
        continuer.call(undefined, detail);
      }
    }
  }

  readPercentage(section: string, detail: string, continuer: (data: TradeRepublic.DetailTypePercentage) => void): this {
    const matched = this.findSection(section);
    if (matched) {
      this.triggerIfDetailIsPercentage(this.findDetail(matched, detail), continuer);
    }
    return this;
  }

  private triggerIfDetailIsCurrency(
    result: TradeRepublic.TimelineDetailSectionDataItem | undefined,
    continuer: (data: TradeRepublic.DetailTypeCurrency) => void
  ) {
    if (typeof result !== "undefined" && typeof result.detail !== "undefined") {
      const detail = result.detail;
      if (typeof detail.type === "undefined" || detail.type !== "currency") {
        return this;
      }

      if (
        typeof detail["value"] !== "undefined" &&
        typeof detail["fractionDigits"] !== "undefined" &&
        typeof detail["currencyId"] !== "undefined"
      ) {
        continuer.call(undefined, detail);
      }
    }
  }

  readCurrency(section: string, detail: string, continuer: (data: TradeRepublic.DetailTypeCurrency) => void): this {
    let matched = this.findSection(section);
    if (matched) {
      this.triggerIfDetailIsCurrency(this.findDetail(matched, detail), continuer);
    }
    return this;
  }

  monetary(sectionDetailPairs: Array<[string, string]>, warningIfNotFound: boolean = true): Entity.Monetary {
    let triggered = false;
    const result = { value: 0, currency: "" };
    for (const pair of sectionDetailPairs) {
      this.readCurrency(pair[0], pair[1], function (detail) {
        result.value = detail.value;
        result.currency = detail.currencyId;
        triggered = true;
      });
    }
    if (!triggered && warningIfNotFound) {
      this.triggerWarning = true;
    }
    return result;
  }

  number(
    sectionDetailPairs: Array<[string, string]>,
    defaultValue: number = 0,
    warningIfNotFound: boolean = true
  ): number {
    let triggered = false;
    let result = defaultValue;
    for (const pair of sectionDetailPairs) {
      this.readDecimal(pair[0], pair[1], function (detail) {
        result = detail.value;
        triggered = true;
      });
    }
    if (!triggered && warningIfNotFound) {
      this.triggerWarning = true;
    }
    return result;
  }

  percentage(
    sectionDetailPairs: Array<[string, string]>,
    defaultValue: number = 0,
    warningIfNotFound: boolean = true
  ): number {
    let triggered = false;
    let result = defaultValue;
    for (const pair of sectionDetailPairs) {
      this.readPercentage(pair[0], pair[1], function (detail) {
        result = detail.value;
        triggered = true;
      });
    }
    if (!triggered && warningIfNotFound) {
      this.triggerWarning = true;
    }
    return result;
  }

  matchSectionSignature(text: string, templates: string[]): boolean {
    for (const template of templates) {
      if (text.startsWith(template)) {
        return true;
      }
    }
    return false;
  }
}
