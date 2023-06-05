import TimelineDetailReader from "./TimelineDetailReader";
import { CAPITAL_GAINS, SOLIDARITY_SURCHARGE } from "../../const";

type DividendType = "normal" | "normal-legacy" | "unknown";
const NORMAL_SECTION_SIGNATURES = ["Dividend > Overview > Settlement > Documents"];
const NORMAL_LEGACY_SECTION_SIGNATURES = ["Dividend > Overview > Accounting > Documents"];

export default class DividendTimelineDetailReader extends TimelineDetailReader<ProcessedEntity.Dividend> {
  read(): ProcessedEntity.Dividend | undefined {
    const type = this.detectType();
    switch (type) {
      case "normal":
        return this.readNormal("Settlement");

      case "normal-legacy":
        return this.readNormal("Accounting");

      default:
        return undefined;
    }
  }

  readNormal(settlementText: string): ProcessedEntity.Dividend {
    const capitalGains = this.monetary([[settlementText, "Capital gains tax"]], false);
    const solidarity = this.monetary([[settlementText, "Solidarity surcharge"]], false);
    const taxTotal = {
      value: capitalGains.value + solidarity.value,
      currency: capitalGains.currency || solidarity.currency,
    };

    return {
      id: this.input.id,
      type: "dividend",
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
      quantity: this.number([["Overview", "Quantity"]]),
      dividendPerPiece: this.monetary([["Overview", "Dividend per piece"]]),
      taxBase: this.monetary([[settlementText, "Tax Base"]]),
      amount: this.monetary([[settlementText, "Total"]]),
      timestamp: this.message.timestamp,
    };
  }

  detectType(): DividendType {
    const signature = this.getSectionSignature();
    if (this.matchSectionSignature(signature, NORMAL_SECTION_SIGNATURES)) {
      return "normal";
    }
    if (this.matchSectionSignature(signature, NORMAL_LEGACY_SECTION_SIGNATURES)) {
      return "normal-legacy";
    }
    console.warn("unknown detail", this);
    return "unknown";
  }
}
