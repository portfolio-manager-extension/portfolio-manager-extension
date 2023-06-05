import TimelineDetailReader from "./TimelineDetailReader";
import { CAPITAL_GAINS, SOLIDARITY_SURCHARGE } from "../../const";

type InterestType = "normal" | "unknown";
const NORMAL_SECTION_SIGNATURES = ["Overview > Settlement > Documents", "Übersicht > Abrechnung > Dokumente"];

export default class InterestTimelineDetailReader extends TimelineDetailReader<ProcessedEntity.Interest> {
  read(): ProcessedEntity.Interest | undefined {
    const type = this.detectType();
    switch (type) {
      case "normal":
        return this.readNormal();
      default:
        return undefined;
    }
  }

  readNormal(): ProcessedEntity.Interest {
    const capitalGains = this.monetary([
      ["Settlement", "Capital gains tax"],
      ["Abrechnung", "Kapitalertragssteuer"],
    ]);
    const solidarity = this.monetary([
      ["Settlement", "Solidarity surcharge"],
      ["Abrechnung", "Solidaritätszuschlag"],
    ]);
    const taxTotal = {
      value: capitalGains.value + solidarity.value,
      currency: capitalGains.currency || solidarity.currency,
    };
    return {
      id: this.input.id,
      type: "interest",
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
      taxBase: this.monetary([
        ["Overview", "Total"],
        ["Übersicht", "Gesamt"],
      ]),
      interestRate: this.percentage([
        ["Overview", "Interest rate p.a."],
        ["Übersicht", "Zinsen p.a."],
      ]),
      averageBalance: this.monetary([
        ["Overview", "Avg balance"],
        ["Übersicht", "Durchschn. Kontostand"],
      ]),
      amount: this.monetary([
        ["Settlement", "Total"],
        ["Abrechnung", "Gesamt"],
      ]),
      timestamp: this.message.timestamp,
    };
  }

  detectType(): InterestType {
    const signature = this.getSectionSignature();
    if (this.matchSectionSignature(signature, NORMAL_SECTION_SIGNATURES)) {
      return "normal";
    }
    console.warn("unknown detail", this);
    return "unknown";
  }
}
