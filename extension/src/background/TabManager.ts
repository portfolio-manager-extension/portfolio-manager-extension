export class TabManager implements Background.TabManager {
  tabs: Map<number, Background.TabInfo>;

  constructor() {
    this.tabs = new Map();
  }

  register(tabId: number, type: Background.TabType, account: Extension.Account | undefined): void {
    if (this.tabs.has(tabId)) {
      return;
    }

    console.debug("TabManager: register tab", tabId, "as", type, "with account", account);
    this.tabs.set(tabId, { tabId: tabId, type: type, account: account });
  }

  remove(tabId: number): void {
    console.debug("TabManager: remove tab", tabId);
    this.tabs.delete(tabId);
  }

  updateCurrentAccount(tabId: number, account: Extension.Account | undefined): void {
    const tab = this.tabs.get(tabId);
    if (typeof tab === "undefined") {
      return;
    }
    console.debug("TabManager: update tab", tabId, "with account", account);
    tab.account = account;
  }

  private find(type: Background.TabType, account: Extension.Account | undefined): Background.TabInfo | undefined {
    const list = Array.from(this.tabs);
    // find exact type and account first
    const exactMatch = list.find(function ([tabId, info]) {
      if (!account) {
        return info.type == type;
      }
      return (
        info.type == type &&
        info.account &&
        info.account.source.type == account.source.type &&
        info.account.source.id == account.source.id
      );
    });
    if (exactMatch) {
      console.debug("TabManager: found exact match type", type, "for account", account);
      return { tabId: exactMatch[1].tabId, type, account: exactMatch[1].account };
    }

    // if there is no exact match, find by type only
    const matchedType = list.find(function ([tabId, info]) {
      return info.type == type;
    });
    if (matchedType) {
      console.debug("TabManager: found tab match type", type);
      return { tabId: matchedType[1].tabId, type, account: matchedType[1].account };
    }
    return undefined;
  }

  findApp(account: Extension.Account | undefined): Background.TabInfo | undefined {
    return this.find("app", account);
  }

  findTradeRepublic(account: Extension.Account | undefined): Background.TabInfo | undefined {
    return this.find("trade-republic", account);
  }

  broadcast(cb: (tab: Background.TabInfo) => void): void {
    chrome.tabs.query({}, (tabs) => {
      const available = new Map<number, boolean>();
      tabs.forEach((tab) => {
        if (tab.id && this.canBroadcastTab(tab)) {
          available.set(tab.id, true);
        }
      });
      this.tabs.forEach(function (tab) {
        if (available.has(tab.tabId)) {
          cb.call(undefined, tab);
        }
      });
    });
  }

  canBroadcastTab(tab: chrome.tabs.Tab): boolean {
    if (typeof tab.url === "undefined") {
      return false;
    }
    if (tab.url.startsWith("chrome://extensions")) {
      return false;
    }
    return true;
  }

  clear(): void {
    this.tabs.clear();
  }
}
