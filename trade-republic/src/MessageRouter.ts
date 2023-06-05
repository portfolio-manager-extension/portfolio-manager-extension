export class MessageRouter implements TradeRepublic.MessageRouter {
  private handlers: Map<string, IMessageHandler<any, any, any>>;

  // repetition is not a problem here, we try to avoid shared file between content script and background
  // noinspection Duplicates
  constructor() {
    this.handlers = new Map();
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (typeof message.type == "undefined" || !this.handlers.has(message.type)) {
        return;
      }

      const handler = this.handlers.get(message.type);
      if (typeof handler == "undefined") {
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

  register(handler: TradeRepublic.RunForMainPage.Handler): this;
  register(handler: TradeRepublic.RunForLoginPage.Handler): this;
  register(handler: IMessageHandler<any, any, any>): this {
    this.handlers.set(handler.type, handler);

    return this;
  }
}
