export class MessageRouter implements Background.MessageRouter {
  private handlers: Map<string, IMessageHandler<any, any, any>>;

  // repetition is not a problem here, we try to avoid shared file between content script and background
  // noinspection Duplicates
  constructor() {
    this.handlers = new Map();
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (typeof message.type === "undefined" || !this.handlers.has(message.type)) {
        return;
      }

      const handler = this.handlers.get(message.type);
      if (typeof handler === "undefined") {
        return;
      }

      handler
        .execute(message, sender)
        .then(function (data) {
          sendResponse(data);
        })
        .catch(function (error) {
          sendResponse(error);
        });
      return true;
    });
  }

  register(handler: TradeRepublic.PageStart.Handler): this;
  register(handler: TradeRepublic.PageStop.Handler): this;
  register(handler: TradeRepublic.StartConsumeMessages.Handler): this;
  register(handler: TradeRepublic.CaptureMessage.Handler): this;
  register(handler: TradeRepublic.GetTradeHistoryData.Handler): this;
  register(handler: Account.CheckAvailability.Handler): this;
  register(handler: Account.Setup.Handler): this;
  register(handler: Tab.Register.Handler): this;
  register(handler: Tab.Remove.Handler): this;
  register(handler: Tab.UpdateCurrentAccount.Handler): this;
  register(handler: Tab.OpenApp.Handler): this;
  register(handler: Tab.OpenTradeRepublic.Handler): this;
  register(handler: Tab.OpenLinkInNewTab.Handler): this;
  register(handler: ExtensionEvent.OnSettingsChanged.Handler): this;
  register(handler: IMessageHandler<any, any, any>): this {
    this.handlers.set(handler.type, handler);

    return this;
  }
}
