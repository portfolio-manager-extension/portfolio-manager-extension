const AppHtmlPage = "app.html";

export class TabOpenAppHandler implements Tab.OpenApp.Handler {
  readonly type = "tab:open-app";
  private tabManager: Background.TabManager;

  constructor(tabManager: Background.TabManager) {
    this.tabManager = tabManager;
  }

  async execute(message: Tab.OpenApp.Message, sender: MessageSender): Promise<undefined> {
    const tab = this.tabManager.findApp(message.payload.account);
    if (!tab) {
      await chrome.tabs.create({ url: chrome.runtime.getURL(AppHtmlPage) });
      return;
    }

    const chromeTab = await chrome.tabs.get(tab.tabId);
    if (!chromeTab) {
      await chrome.tabs.create({ url: chrome.runtime.getURL(AppHtmlPage) });
      return;
    }

    await chrome.tabs.update(tab.tabId, { active: true });
    await chrome.windows.update(chromeTab.windowId, { focused: true });

    if (!tab.account && message.payload) {
      this.tabManager.updateCurrentAccount(tab.tabId, message.payload.account);
    }
    return undefined;
  }
}
