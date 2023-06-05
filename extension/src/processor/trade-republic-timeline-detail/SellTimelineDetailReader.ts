import TimelineDetailReader from "./TimelineDetailReader";
import { CAPITAL_GAINS, SOLIDARITY_SURCHARGE } from "../../const";

type SellType = "normal" | "tax-optimized" | "tax-optimized-legacy" | "normal-legacy" | "unknown";

const NORMAL_SECTION_SIGNATURES = ["Overview > History > Settlement > Documents"];
const TAX_OPTIMIZED_SECTION_SIGNATURES = ["Overview > History > Settlement 1 > Settlement 2 > Documents"];
const NORMAL_LEGACY_SECTION_SIGNATURES = ["Overview > History > Accounting > Documents"];
const TAX_OPTIMIZED_LEGACY_SECTION_SIGNATURES = ["Overview > History > Accounting 1 > Accounting 2 > Documents"];

export default class SellTimelineDetailReader extends TimelineDetailReader<ProcessedEntity.Sell> {
  read(): ProcessedEntity.Sell | undefined {
    const type = this.detectType();
    switch (type) {
      case "normal":
        return this.readNormal("Settlement");
      case "normal-legacy":
        return this.readNormal("Accounting");
      case "tax-optimized":
        return this.readTaxOptimized("Settlement 1", "Settlement 2");
      case "tax-optimized-legacy":
        return this.readTaxOptimized("Accounting 1", "Accounting 2");
      default:
        return undefined;
    }
  }

  readNormal(settlementText: string): ProcessedEntity.Sell {
    const capitalGains = this.monetary([[settlementText, "Capital gains tax"]]);
    const solidarity = this.monetary([[settlementText, "Solidarity surcharge"]]);
    const taxTotal = {
      value: capitalGains.value + solidarity.value,
      currency: capitalGains.currency || solidarity.currency,
    };
    return {
      id: this.input.id,
      type: "sell",
      quantity: this.number([["Overview", "Amount"]]),
      price: this.monetary([["Overview", "Price"]]),
      taxBase: this.monetary([
        ["Overview", "Total"],
        [settlementText, "Tax Base"],
      ]),
      fee: this.monetary([[settlementText, "External cost surcharge"]]),
      tax: {
        details: {
          [CAPITAL_GAINS]: {
            text: "Capital gains tax",
            type: CAPITAL_GAINS,
            amount: capitalGains,
          },
          [SOLIDARITY_SURCHARGE]: {
            text: "Solidarity surcharge",
            type: SOLIDARITY_SURCHARGE,
            amount: solidarity,
          },
        },
        total: taxTotal,
      },
      taxOptimized: {
        details: {},
        total: { value: 0, currency: "" },
      },
      amount: this.monetary([[settlementText, "Total"]]),
      timestamp: this.message.timestamp,
    };
  }

  readTaxOptimized(settlementTextOne: string, settlementTextTwo: string): ProcessedEntity.Sell {
    const capitalGains = this.monetary([[settlementTextOne, "Capital gains tax"]], false);
    const solidarity = this.monetary([[settlementTextOne, "Solidarity surcharge"]], false);
    const taxTotal = {
      value: capitalGains.value + solidarity.value,
      currency: capitalGains.currency || solidarity.currency,
    };
    const capitalGainsOtz = this.monetary([[settlementTextTwo, "Capital gains tax optimization"]]);
    const solidarityOtz = this.monetary([[settlementTextTwo, "Solidarity surcharge optimization"]]);
    const taxTotalOtz = {
      value: capitalGainsOtz.value + solidarityOtz.value,
      currency: capitalGainsOtz.currency || solidarityOtz.currency,
    };
    const total1 = this.monetary([[settlementTextOne, "Total"]]);
    const total2 = this.monetary([[settlementTextTwo, "Total"]]);
    return {
      id: this.input.id,
      type: "sell",
      quantity: this.number([["Overview", "Amount"]]),
      price: this.monetary([["Overview", "Price"]]),
      taxBase: this.monetary([
        ["Overview", "Total"],
        [settlementTextOne, "Tax Base"],
      ]),
      fee: this.monetary([[settlementTextOne, "External cost surcharge"]]),
      tax: {
        details: {
          [CAPITAL_GAINS]: {
            text: "Capital gains tax",
            type: CAPITAL_GAINS,
            amount: capitalGains,
          },
          [SOLIDARITY_SURCHARGE]: {
            text: "Solidarity surcharge",
            type: SOLIDARITY_SURCHARGE,
            amount: solidarity,
          },
        },
        total: taxTotal,
      },
      taxOptimized: {
        details: {
          [CAPITAL_GAINS]: {
            text: "Capital gains tax optimization",
            type: CAPITAL_GAINS,
            amount: capitalGains,
          },
          [SOLIDARITY_SURCHARGE]: {
            text: "Solidarity surcharge optimization",
            type: SOLIDARITY_SURCHARGE,
            amount: solidarity,
          },
        },
        total: taxTotalOtz,
      },
      amount: { value: total1.value + total2.value, currency: total1.currency || total2.currency },
      timestamp: this.message.timestamp,
    };
  }

  detectType(): SellType {
    const signature = this.getSectionSignature();
    if (this.matchSectionSignature(signature, NORMAL_SECTION_SIGNATURES)) {
      return "normal";
    }
    if (this.matchSectionSignature(signature, TAX_OPTIMIZED_SECTION_SIGNATURES)) {
      return "tax-optimized";
    }
    if (this.matchSectionSignature(signature, NORMAL_LEGACY_SECTION_SIGNATURES)) {
      return "normal-legacy";
    }
    if (this.matchSectionSignature(signature, TAX_OPTIMIZED_LEGACY_SECTION_SIGNATURES)) {
      return "tax-optimized-legacy";
    }

    console.warn("unknown detail", this);
    return "unknown";
  }
}
