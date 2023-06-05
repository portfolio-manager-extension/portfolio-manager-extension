declare namespace Background {
  interface MessageSender {
    sendToTab(tabId: number, message: TradeRepublic.RunForLoginPage.Message): Promise<undefined>;
    sendToTab(tabId: number, message: TradeRepublic.RunForMainPage.Message): Promise<undefined>;
    sendToTab(tabId: number, message: ExtensionEvent.OnSettingsChanged.Message): Promise<undefined>;
  }

  interface MessageRouter {
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
  }

  type TabType = "app" | "trade-republic" | "popup";
  type TabInfo = {
    tabId: number;
    type: TabType;
    account: Extension.Account | undefined;
  };

  interface TabManager {
    register(tabId: number, type: TabType, account: Extension.Account | undefined): void;
    remove(tabId: number): void;
    updateCurrentAccount(tabId: number, account: Extension.Account | undefined): void;
    broadcast(cb: (tab: TabInfo) => void): void;
    findApp(account: Extension.Account | undefined): TabInfo | undefined;
    findTradeRepublic(account: Extension.Account | undefined): TabInfo | undefined;
    clear(): void;
  }

  interface TradeRepublicManager {
    onPageStart(tabId: number): void;
    onPageStop(tabId: number): void;
    onStartConsumeMessages(tabId: number, account: Extension.Account): void;
    onTabRemoved(tabId: number): void;
    onBeforeAccountRequest(tabId: number): void;
    onReceiveFilteredMessage(tabId: number, message: TradeRepublic.FilteredMessage): void;
  }

  interface TradeRepublicMessageConsumer {
    consume(message: TradeRepublic.FilteredMessage, account: Extension.Account): Promise<void>;
  }

  interface TradeRepublicMessageProcessor<T> {
    match(message: RawEntity.Message, account: Extension.Account): boolean;
    process(message: RawEntity.Message, account: Extension.Account): T;
    store(value: T, account: Extension.Account): Promise<void>;
  }
}
