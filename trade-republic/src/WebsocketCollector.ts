import WebsocketMessageParser from "./WebsocketMessageParser";

const ICON_TO_TYPE_MAP: { [key: string]: string } = {
  "https://assets.traderepublic.com/img/icon/timeline/Arrow-Left.png": "sell",
  "https://assets.traderepublic.com/img/icon/timeline/Arrow-Right.png": "buy",
  "https://assets.traderepublic.com/img/icon/timeline/Dividend.png": "dividend",
  "https://assets.traderepublic.com/img/icon/timeline/Vorabpauschale.png": "interest",
  "https://assets.traderepublic.com/img/icon/timeline/SavingsPlanExecuted.png": "saving-plan-execute",
  "https://assets.traderepublic.com/img/icon/timeline/CashIn.png": "deposit",
  "https://assets.traderepublic.com/img/icon/timeline/CashOut.png": "withdraw",
  "https://assets.traderepublic.com/img/icon/timeline/Change.png": "credit-shares",
  "https://assets.traderepublic.com/img/icon/timeline/ReferralFirstTradeExecuted.png": "award-money",
  "https://assets.traderepublic.com/img/icon/timeline/TaxPaymentBack.png": "tax-payment-back",

  "https://assets.traderepublic.com/img/icon/timeline/Plus.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/Cross.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/Document.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/human.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/ExemptionOrderChanged.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/ExemptionOrderChangeRequested.png": "info",

  "https://assets.traderepublic.com/img/icon/timeline/SavingsPlanChanged.png": "unused",
  "https://assets.traderepublic.com/img/icon/timeline/ExPostCostReport.png": "unused",
  "https://assets.traderepublic.com/img/icon/timeline/Jahressteuerbescheinigung.png": "unused",
  "https://assets.traderepublic.com/img/icon/timeline/SavingsPlanFailed.png": "unused",
};

export default class WebsocketCollector {
  private ws: WebSocket;
  private communicator: TradeRepublic.BackgroundCommunicator;
  private interval: any | null = null;
  private isConnected: boolean = false;
  private currentMessageId = 1;
  private messageType = new Map<string, string>();
  private readonly statusListener: (message: string, done: boolean) => void;

  constructor(
    communicator: TradeRepublic.BackgroundCommunicator,
    statusListener: (message: string, done: boolean) => void
  ) {
    this.communicator = communicator;
    this.statusListener = statusListener;

    this.statusListener("Start collecting...", false);
    this.ws = new WebSocket("wss://api.traderepublic.com/");
    this.ws.onopen = () => {
      this.onWebsocketOpen();
    };
    this.ws.onclose = () => {
      this.onWebsocketClose();
    };
    this.ws.onmessage = (msg) => {
      this.onMessage(msg);
    };
  }

  onWebsocketOpen() {
    this.statusListener("Connection opened...", false);
    this.sendConnectMessage();
  }

  onWebsocketClose() {
    this.statusListener("Connection closed...", false);
    setTimeout(() => {
      this.statusListener("", true);
    }, 1000);
  }

  onMessage(messageEvent: MessageEvent) {
    if (messageEvent.data == "connected") {
      this.isConnected = true;
      // flow to collect data:
      //  - start with timeline after = null
      //  - then collect timeline detail of that result in a timeout with sleep random from 100-3 seconds
      //  - then check if there is after we call timeline with after = that value sleep between 3-4 seconds
      //  - then stop
      this.sendGetTimelines(null);
      return;
    }

    const parser = new WebsocketMessageParser();
    const response = parser.parseResponseMessage(messageEvent.data);
    if (response.valid) {
      this.sendUnsub(response.messageId);
      if (!this.messageType.has(response.messageId)) {
        return;
      }

      const type = this.messageType.get(response.messageId);
      if (type == "timeline-detail") {
        const message: TradeRepublic.FilteredMessage = {
          received: JSON.stringify(response.data),
          sent: "",
          type: "timeline-event-detail",
          locale: "en",
        };
        this.communicator.sendFilteredMessage(message);
        return;
      }

      if (type == "timeline") {
        const message: TradeRepublic.FilteredMessage = {
          received: JSON.stringify(response.data),
          sent: "",
          type: "timeline-events",
          locale: "en",
        };
        this.communicator.sendFilteredMessage(message);
        this.continueGetTimelines(response.data);
        return;
      }
    }
  }

  stop() {
    this.isConnected = false;
    this.ws.close();
  }

  detectType(icon: string): string {
    if (typeof ICON_TO_TYPE_MAP[icon] != "undefined") {
      return ICON_TO_TYPE_MAP[icon];
    }
    return "unknown";
  }

  canGetTimelineDetail(type: string): boolean {
    return ["buy", "sell", "dividend", "interest", "credit-shares", "tax-payment-back"].indexOf(type) !== -1;
  }

  collectingTimelineDetails(response: TradeRepublic.WebsocketTimelineResponse) {
    const status =
      "Collecting timeline " +
      this.formatDate(response.data[response.data.length - 1].data.timestamp) +
      " -> " +
      this.formatDate(response.data[0].data.timestamp);
    this.statusListener(status, false);

    for (const item of response.data) {
      if (item.type != "timelineEvent") {
        continue;
      }
      const type = this.detectType(item.data.icon);
      if (this.canGetTimelineDetail(type)) {
        setTimeout(() => {
          this.sendGetTimelineDetail(item.data.id);
        }, 100 + Math.floor(Math.random() * 3000));
      }
    }
  }

  formatDate(timestamp: number): string {
    const instant = new Date(timestamp);
    const result = [];
    const date = instant.getDate();
    result.push(date < 10 ? "0" + date : date.toString());
    const month = instant.getMonth() + 1;
    result.push(month < 10 ? "0" + month : month.toString());
    result.push(instant.getFullYear());
    return result.join(".");
  }

  continueGetTimelines(response: TradeRepublic.WebsocketTimelineResponse) {
    this.collectingTimelineDetails(response);
    if (response.data.length == 0 || typeof response.cursors == "undefined" || !response.cursors.after) {
      this.statusListener("Almost done...", false);
      setTimeout(() => {
        this.stop();
      }, 10000);
      return;
    }

    const after = response.cursors.after;
    setTimeout(() => {
      this.sendGetTimelines(after);
    }, 3100 + Math.floor(Math.random() * 1000));
  }

  sendConnectMessage() {
    const data = {
      locale: "en",
      platformId: "webtrading",
      platformVersion: "chrome - 112.0.0",
      clientId: "app.traderepublic.com",
      clientVersion: "1.22.4",
    };
    const msg = `connect 26 ${JSON.stringify(data)}`;
    this.ws.send(msg);
    this.interval = setInterval(() => {
      this.sendEchoMessage();
    }, 10000);
  }

  sendEchoMessage() {
    if (!this.isConnected) {
      clearInterval(this.interval);
      return;
    }

    const msg = `echo ${Date.now()}`;
    this.ws.send(msg);
  }

  sendUnsub(messageId: string) {
    if (!this.isConnected) {
      return;
    }
    this.ws.send(`unsub ${messageId}`);
  }

  sendGetTimelines(after: string | null) {
    if (!this.isConnected) {
      return;
    }

    const data: { type: string; after?: string } = {
      type: "timeline",
    };
    if (after) {
      data.after = after;
    }
    const messageId = this.currentMessageId++;
    this.messageType.set(messageId.toString(), "timeline");
    this.ws.send(`sub ${messageId} ${JSON.stringify(data)}`);
  }

  sendGetTimelineDetail(id: string) {
    if (!this.isConnected) {
      return;
    }

    const data: { type: string; id: string } = {
      type: "timelineDetail",
      id: id,
    };
    const messageId = this.currentMessageId++;
    this.messageType.set(messageId.toString(), "timeline-detail");
    this.ws.send(`sub ${messageId} ${JSON.stringify(data)}`);
  }
}
