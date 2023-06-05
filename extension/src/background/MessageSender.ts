export class MessageSender implements Background.MessageSender {
  sendToTab(tabId: number, message: TradeRepublic.RunForLoginPage.Message): Promise<undefined>;
  sendToTab(tabId: number, message: TradeRepublic.RunForMainPage.Message): Promise<undefined>;
  sendToTab(tabId: number, message: ExtensionEvent.OnSettingsChanged.Message): Promise<undefined>;
  async sendToTab(tabId: number, message: any): Promise<any> {
    // @ts-ignored
    return chrome.tabs.sendMessage(tabId, message);
  }
}
