export class MessageSender implements TradeRepublic.MessageSender {
  send(message: TradeRepublic.PageStart.Message): Promise<undefined>;
  send(message: TradeRepublic.PageStop.Message): Promise<undefined>;
  send(message: TradeRepublic.CaptureMessage.Message): Promise<void>;
  send(message: TradeRepublic.StartConsumeMessages.Message): Promise<void>;
  send(message: TradeRepublic.GetTradeHistoryData.Message): Promise<TradeRepublic.GetTradeHistoryData.Response>;
  send(message: Account.CheckAvailability.Message): Promise<Account.CheckAvailability.Result>;
  send(message: Account.Setup.Message): Promise<Account.Setup.Result>;
  send(message: Tab.OpenApp.Message): Promise<undefined>;
  send(message: Tab.OpenLinkInNewTab.Message): Promise<undefined>;
  async send(message: any): Promise<any> {
    // @ts-ignored
    return chrome.runtime.sendMessage(message);
  }
}
