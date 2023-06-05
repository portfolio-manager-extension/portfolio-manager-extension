export class WebsocketMessageFilter implements TradeRepublic.WebsocketMessageFilter {
  private sendToBackground: boolean;
  private readonly communicator: TradeRepublic.BackgroundCommunicator;
  private readonly typeDetector: TradeRepublic.WebsocketMessageTypeDetector;

  constructor(
    communicator: TradeRepublic.BackgroundCommunicator,
    typeDetector: TradeRepublic.WebsocketMessageTypeDetector,
    helper: TradeRepublic.Helper
  ) {
    this.sendToBackground = true;
    this.communicator = communicator;
    this.typeDetector = typeDetector;

    document.addEventListener("trade-republic-ws-message-received", (e: any) => {
      if (!this.sendToBackground && this.isParsableMessage(e.detail.data)) {
        return;
      }

      const detectResult = this.typeDetector.detect(e.detail.url, e.detail.data);
      if (!detectResult.valid) {
        return;
      }
      const message: TradeRepublic.FilteredMessage = {
        received: JSON.stringify(detectResult.data),
        sent: typeof detectResult.data === "undefined" ? "" : JSON.stringify(detectResult.sentData),
        type: detectResult.type,
        locale: helper.readLocale(),
      };

      if (this.shouldSendToBackground(detectResult.type)) {
        this.communicator.sendFilteredMessage(message);
      }
    });
  }

  disableSendToBackground() {
    this.sendToBackground = false;
  }

  isParsableMessage(input: string): boolean {
    if (input == "connected" || input.startsWith("echo")) {
      return false;
    }
    return true;
  }

  shouldSendToBackground(contentType: TradeRepublic.MessageType): boolean {
    if (contentType == "timeline-events" || contentType == "timeline-event-detail") {
      return true;
    }
    if (contentType == "positions" || contentType == "instrument-info") {
      return true;
    }
    if (contentType == "cash" || contentType == "available-cash") {
      return true;
    }
    if (contentType == "realtime-ticker") {
      return true;
    }
    return false;
  }
}
