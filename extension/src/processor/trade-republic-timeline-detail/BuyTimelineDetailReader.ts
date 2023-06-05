import TimelineDetailReader from "./TimelineDetailReader";

type BuyType = "normal" | "fraction" | "normal-legacy" | "unknown";

const FRACTION_SECTION_SIGNATURES = ["Overview > History > Settlement 1 > Settlement 2 > Documents"];
const NORMAL_SECTION_SIGNATURES = ["Overview > History > Settlement > Documents"];
const NORMAL_LEGACY_SECTION_SIGNATURES = ["Overview > History > Accounting > Documents"];

export default class BuyTimelineDetailReader extends TimelineDetailReader<ProcessedEntity.Buy> {
  read(): ProcessedEntity.Buy | undefined {
    const type = this.detectType();
    switch (type) {
      case "normal":
        return this.readNormal();
      case "normal-legacy":
        return this.readNormalLegacy();
      case "fraction":
        return this.readFraction();
      default:
        this.triggerWarning = true;
        return undefined;
    }
  }

  readNormal(): ProcessedEntity.Buy {
    return {
      id: this.input.id,
      type: "buy",
      quantity: this.number([["Overview", "Amount"]]),
      price: this.monetary([["Overview", "Price"]]),
      fee: this.monetary([["Settlement", "External cost surcharge"]]),
      taxBase: this.monetary([
        ["Overview", "Total"],
        ["Settlement", "Tax Base"],
      ]),
      amount: this.monetary([["Settlement", "Total"]]),
      timestamp: this.message.timestamp,
    };
  }

  readNormalLegacy(): ProcessedEntity.Buy {
    return {
      id: this.input.id,
      type: "buy",
      quantity: this.number([["Overview", "Amount"]]),
      price: this.monetary([["Overview", "Price"]]),
      fee: this.monetary([["Accounting", "External cost surcharge"]]),
      taxBase: this.monetary([
        ["Overview", "Total"],
        ["Accounting", "Tax Base"],
      ]),
      amount: this.monetary([["Accounting", "Total"]]),
      timestamp: this.message.timestamp,
    };
  }

  readFraction(): ProcessedEntity.Buy {
    const fee1 = this.monetary([["Settlement 1", "External cost surcharge"]], false);
    const fee2 = this.monetary([["Settlement 2", "External cost surcharge"]], false);

    const taxBase1 = this.monetary([["Settlement 1", "Tax Base"]], false);
    const taxBase2 = this.monetary([["Settlement 2", "Tax Base"]], false);

    const total1 = this.monetary([["Settlement 1", "Total"]], false);
    const total2 = this.monetary([["Settlement 2", "Total"]], false);

    return {
      id: this.input.id,
      type: "buy",
      quantity: this.number([["Overview", "Amount"]]),
      price: this.monetary([["Overview", "Price"]]),
      fee: { value: fee1.value + fee2.value, currency: fee1.currency || fee2.currency },
      taxBase: { value: taxBase1.value + taxBase2.value, currency: taxBase1.currency || taxBase2.currency },
      amount: { value: total1.value + total2.value, currency: total1.currency || total2.currency },
      timestamp: this.message.timestamp,
    };
  }

  detectType(): BuyType {
    const signature = this.getSectionSignature();
    if (this.matchSectionSignature(signature, NORMAL_SECTION_SIGNATURES)) {
      return "normal";
    }
    if (this.matchSectionSignature(signature, FRACTION_SECTION_SIGNATURES)) {
      return "fraction";
    }
    if (this.matchSectionSignature(signature, NORMAL_LEGACY_SECTION_SIGNATURES)) {
      return "normal-legacy";
    }

    console.warn("unknown detail", this);
    return "unknown";
  }
}
