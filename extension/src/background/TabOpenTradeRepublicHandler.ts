export class TabOpenTradeRepublicHandler implements Tab.OpenTradeRepublic.Handler {
  readonly type = "tab:open-trade-republic";
  private tabManager: Background.TabManager;

  constructor(tabManager: Background.TabManager) {
    this.tabManager = tabManager;
  }

  async execute(message: Tab.OpenTradeRepublic.Message, sender: MessageSender): Promise<undefined> {
    const tab = this.tabManager.findTradeRepublic(message.payload.account);
    if (!tab) {
      await chrome.tabs.create({ url: "https://app.traderepublic.com" });
      return;
    }

    const chromeTab = await chrome.tabs.get(tab.tabId);
    if (!chromeTab) {
      await chrome.tabs.create({ url: "https://app.traderepublic.com" });
      return;
    }

    await chrome.tabs.update(tab.tabId, { active: true });
    await chrome.windows.update(chromeTab.windowId, { focused: true });

    return undefined;
  }
}
