import { TradeRepublicTab } from "./TradeRepublicTab";

export class TradeRepublicManager implements Background.TradeRepublicManager {
  private tabs: Map<number, TradeRepublicTab>;
  private sender: Background.MessageSender;
  private extensionRepository: Storage.ExtensionRepository;
  private tabManager: Background.TabManager;
  private readonly messageConsumer: Background.TradeRepublicMessageConsumer;

  constructor(
    sender: Background.MessageSender,
    extensionRepository: Storage.ExtensionRepository,
    tabManager: Background.TabManager,
    messageConsumer: Background.TradeRepublicMessageConsumer
  ) {
    this.tabs = new Map<number, TradeRepublicTab>();
    this.sender = sender;
    this.extensionRepository = extensionRepository;
    this.tabManager = tabManager;
    this.messageConsumer = messageConsumer;
  }

  onBeforeAccountRequest(tabId: number): void {
    const tab = this.tabs.get(tabId);
    if (typeof tab === "undefined") {
      return;
    }

    tab.clearAccountRequestTimeout();
    tab.enableMessageBuffer();
    if (!tab.isMainPageExecuted()) {
      tab.markMainPageExecuted();
      (async () => {
        await this.sender.sendToTab(tab.id, {
          type: "trade-republic:run-for-main-page",
          payload: await this.extensionRepository.getSettings(),
        });
      })();
    }
  }

  onPageStart(tabId: number): void {
    if (!this.tabs.has(tabId)) {
      this.tabs.set(tabId, new TradeRepublicTab(tabId, this.messageConsumer));
    }

    const tab = this.tabs.get(tabId);
    if (typeof tab === "undefined") {
      return;
    }

    this.tabManager.register(tabId, "trade-republic", undefined);
    tab.pageStart((trt) => {
      (async () => {
        await this.sender.sendToTab(trt.id, {
          type: "trade-republic:run-for-login-page",
          payload: await this.extensionRepository.getSettings(),
        });
      })();
    });
  }

  onPageStop(tabId: number): void {
    const tab = this.tabs.get(tabId);
    if (typeof tab === "undefined") {
      return;
    }

    tab.pageStop();
    this.tabManager.remove(tabId);
  }

  onReceiveFilteredMessage(tabId: number, message: TradeRepublic.FilteredMessage): void {
    const tab = this.tabs.get(tabId);
    if (typeof tab === "undefined") {
      return;
    }

    tab.pushMessage(message);
  }

  onStartConsumeMessages(tabId: number, account: Extension.Account): void {
    const tab = this.tabs.get(tabId);
    if (typeof tab === "undefined") {
      return;
    }

    tab.consumeMessages(account);
    this.tabManager.updateCurrentAccount(tabId, account);
  }

  onTabRemoved(tabId: number): void {
    console.info("TradeRepublicManager: tab close, delete all info");
    this.tabs.delete(tabId);
  }
}
