declare namespace UI {
  interface Listener {
    onAccountsChangedListener(cb: (accounts: Extension.Account[]) => void): () => void;
    onSettingsChangedListener(cb: (settings: Extension.Settings, sender?: MessageSender) => void): () => void;
  }

  interface Dispatcher {
    dispatchAccountsChanged(accounts: Extension.Account[]): void;
    dispatchSettingsChanged(settings: Extension.Settings): void;
    openApp(account: Extension.Account): void;
    openTradeRepublic(account: Extension.Account): void;
    openLink(url: string): void;
    registerTab(type: Background.TabType, account: Extension.Account | undefined): void;
    removeTab(): void;
    updateCurrentAccountOfTab(account: Extension.Account | undefined): void;
    reprocessMessage(account: Extension.Account, messageId: string): void;
  }

  type Link = {
    welcome: string;
    disclaimer: string;
    howItWorks: string;
    termsOfService: string;
    collectedData: string;
    changesLog: string;
    githubSourceCode: string;
    buyMeACoffee: string;
  };

  interface LinkFactory {
    make(locale: Locale, full: boolean): Link;
    getLobbyPage(): string;
    getWelcomePage(): string;
    getPageWhenLoggingOrRedirectingFromLobby(account: Extension.Account): string;
    getDefaultPageForActivitiesMenu(account: Extension.Account): string;
    getDefaultPageForPortfolioMenu(account: Extension.Account): string;
    getDefaultPageForYourDataMenu(account: Extension.Account): string;
    getInterestPage(account: Extension.Account): string;
    getRawMessagesPage(account: Extension.Account): string;
    getProcessedDataPage(account: Extension.Account): string;
    getImportPage(account: Extension.Account): string;
    getExportPage(account: Extension.Account): string;
    getAccountPage(account: Extension.Account): string;
    getActivityInterestPage(account: Extension.Account): string;
    getActivityCashFlowPage(account: Extension.Account): string;
    getActivityDividendPage(account: Extension.Account): string;
    getActivityTradingPage(account: Extension.Account): string;
    getPortfolioAllPositionsLink(account: Extension.Account): string;
    getPortfolioLink(account: Extension.Account, portfolioId: string): string;
    getPortfolioLink(account: Extension.Account, portfolioId: string, instrumentId: string): string;
    getManagePortfoliosLink(account: Extension.Account): string;
  }

  type FieldRef<T> = {
    validate(): boolean;
    getName(): string;
    getValue(): T;
    getNameValue(): object;
  };

  type FieldRefList = Array<{ current: FieldRef<any> | null }>;

  type InlineLayout = "4-8" | "5-7" | "6-6" | "7-5" | "8-4";

  type PopupTranslation = {
    noAccount: {
      infoText: string;
      openTradeRepublicApp: string;
      learnHowItWork: string;
      disclaimer: string;
      collectedData: string;
      viewSourceCode: string;
      buyMeACoffee: string;
    };
    hasAccounts: {
      viewDataBtn: string;
      openTradeRepublic: string;
    };
  };

  interface PopupTranslationFactory {
    make(locale: Locale): PopupTranslation;
  }
}
