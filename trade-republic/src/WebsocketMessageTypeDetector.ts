import WebsocketSentMessageManager from "./WebsocketSentMessageManager";

const LOG_UNKNOWN_SENT_DATA = false;
const SENT_TYPES_MAP: { [key: string]: TradeRepublic.MessageType } = {
  timeline: "timeline-events",
  timelineDetail: "timeline-event-detail",
  compactPortfolio: "positions",
  instrument: "instrument-info",
  ticker: "realtime-ticker",
  savingsPlans: "saving-plans",
  homeInstrumentExchange: "exchange-info",
  cash: "cash",
  availableCash: "available-cash",
};

export default class WebsocketMessageTypeDetector implements TradeRepublic.WebsocketMessageTypeDetector {
  private map: Map<string, WebsocketSentMessageManager>;
  private parser: TradeRepublic.WebsocketMessageParser;

  constructor(parser: TradeRepublic.WebsocketMessageParser) {
    this.map = new Map();
    this.parser = parser;

    document.addEventListener("trade-republic-ws-message-sent", (e: any) => {
      const url = e.detail.url;
      if (!this.map.has(url)) {
        this.map.set(url, new WebsocketSentMessageManager());
      }

      const subResult = this.parser.parseSubMessage(e.detail.data);
      if (subResult.valid) {
        this.map.get(url)!.sub(subResult.messageId, subResult.data);
        return;
      }

      const unsubResult = this.parser.parseUnsubMessage(e.detail.data);
      if (unsubResult.valid) {
        this.map.get(url)!.unsub(unsubResult.messageId);
        return;
      }
    });
  }

  findSentData(url: string, messageId: string): any {
    return this.map.get(url)!.get(messageId);
  }

  detect(url: string, input: string): TradeRepublic.DetectTypeResult {
    const parseResult = this.parser.parseResponseMessage(input);
    if (!parseResult.valid) {
      return { valid: false, type: "unknown", source: "input", sentData: undefined, data: undefined };
    }
    const sentData = this.findSentData(url, parseResult.messageId);
    const typeFromSentData = this.detectTypeBySentData(sentData);
    if (typeof typeFromSentData !== "undefined") {
      return {
        valid: true,
        type: typeFromSentData,
        source: "sent-data",
        sentData: sentData,
        data: parseResult.data,
      };
    }

    if (LOG_UNKNOWN_SENT_DATA) {
      console.debug("Unknown message:", sentData, parseResult.data);
    }
    return {
      valid: true,
      type: this.detectMessageTypeByParsedInput(parseResult.data),
      source: "input",
      sentData: sentData,
      data: parseResult.data,
    };
  }

  detectTypeBySentData(sentData: any): TradeRepublic.MessageType | undefined {
    if (typeof sentData === "undefined") {
      return undefined;
    }
    if (typeof sentData["type"] !== "undefined") {
      const type: string = sentData["type"];
      if (typeof SENT_TYPES_MAP[type] !== "undefined") {
        return SENT_TYPES_MAP[type];
      }
    }
    return undefined;
  }

  detectMessageTypeByParsedInput(input: any): TradeRepublic.MessageType {
    if (this.isRealtimeTicker(input)) return "realtime-ticker";
    if (this.isExchangeInfo(input)) return "exchange-info";
    if (this.isTimelineEvent(input)) return "timeline-events";
    if (this.isSavingPlans(input)) return "saving-plans";
    if (this.isPositions(input)) return "positions";
    if (this.isTimelineEventDetail(input)) return "timeline-event-detail";
    if (this.isInstrumentInfo(input)) return "instrument-info";
    return "unknown";
  }

  isRealtimeTicker(input: any): boolean {
    if (typeof input["qualityId"] != "undefined" && input["qualityId"] == "realtime") {
      return true;
    }
    return false;
  }

  isExchangeInfo(input: any): boolean {
    if (
      typeof input["exchangeId"] != "undefined" &&
      typeof input["orderModes"] != "undefined" &&
      typeof input["openTimeOffsetMillis"] != "undefined"
    ) {
      return true;
    }
    return false;
  }

  isSavingPlans(input: any): boolean {
    if (typeof input["savingsPlan"] === "undefined") {
      return false;
    }
    return true;
  }

  isPositions(input: any): boolean {
    if (typeof input["positions"] === "undefined") {
      return false;
    }
    if (!Array.isArray(input.positions)) {
      return false;
    }
    return true;
  }

  isTimelineEvent(input: any) {
    if (typeof input["cursors"] === "undefined") {
      return false;
    }
    if (typeof input["data"] === "undefined") {
      return false;
    }
    if (!Array.isArray(input["data"])) {
      return false;
    }
    if (input.data.length == 0) {
      return false;
    }
    if (typeof input.data[0].type === "undefined") {
      return false;
    }
    return input.data[0].type === "timelineEvent" || input.data[0].type === "timelineAccountBalance";
  }

  isTimelineEventDetail(input: any) {
    if (typeof input["id"] === "undefined") {
      return false;
    }
    if (typeof input["titleText"] === "undefined") {
      return false;
    }
    if (typeof input["subtitleText"] === "undefined") {
      return false;
    }
    if (!Array.isArray(input["sections"])) {
      return false;
    }
    if (input.sections.length == 0) {
      return false;
    }
    return true;
  }

  isInstrumentInfo(input: any) {
    if (typeof input["isin"] === "undefined") {
      return false;
    }
    if (typeof input["name"] === "undefined") {
      return false;
    }
    if (typeof input["shortName"] === "undefined") {
      return false;
    }
    if (typeof input["typeId"] === "undefined") {
      return false;
    }
    if (typeof input["company"] === "undefined") {
      return false;
    }
    return true;
  }
}
