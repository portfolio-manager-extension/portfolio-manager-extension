export const LinkFactory: UI.LinkFactory = {
  make(locale: Locale, full: boolean): UI.Link {
    const external = {
      githubSourceCode: "https://github.com/portfolio-manager-extension/portfolio-manager-extension",
      buyMeACoffee: "",
    };

    const links = {
      welcome: `/${locale}/welcome`,
      disclaimer: `/${locale}/disclaimer`,
      howItWorks: `/${locale}/how-it-works`,
      termsOfService: `/${locale}/terms-of-service`,
      collectedData: `/${locale}/collected-data-and-reasons`,
      changesLog: `/${locale}/changes-log`,
    };

    if (full) {
      const basedUrl = chrome.runtime.getURL(`app.html?`);
      return Object.assign(
        {},
        {
          welcome: basedUrl + "#" + links.welcome,
          disclaimer: basedUrl + "#" + links.disclaimer,
          howItWorks: basedUrl + "#" + links.howItWorks,
          termsOfService: basedUrl + "#" + links.termsOfService,
          collectedData: basedUrl + "#" + links.collectedData,
          changesLog: basedUrl + "#" + links.changesLog,
        },
        external
      );
    }
    return Object.assign({}, links, external);
  },

  getWelcomePage(): string {
    return `/en/welcome`;
  },

  getLobbyPage(): string {
    return `/`;
  },

  getPageWhenLoggingOrRedirectingFromLobby(account: Extension.Account): string {
    return this.getPortfolioAllPositionsLink(account);
  },

  getDefaultPageForActivitiesMenu(account: Extension.Account): string {
    return this.getActivityTradingPage(account);
  },

  getDefaultPageForPortfolioMenu(account: Extension.Account): string {
    return this.getPortfolioAllPositionsLink(account);
  },

  getDefaultPageForYourDataMenu(account: Extension.Account): string {
    return this.getRawMessagesPage(account);
  },

  getInterestPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/activities/interest`;
  },

  getRawMessagesPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/your-data/raw-messages`;
  },

  getProcessedDataPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/your-data/processed-data`;
  },

  getImportPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/your-data/import`;
  },

  getExportPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/your-data/export`;
  },

  getAccountPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/your-data/account`;
  },

  getActivityInterestPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/activities/interest`;
  },

  getActivityCashFlowPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/activities/cash-in-and-out`;
  },

  getActivityDividendPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/activities/dividend`;
  },

  getActivityTradingPage(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/activities/trading`;
  },

  getPortfolioAllPositionsLink(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/portfolio/all-positions`;
  },

  getPortfolioLink(account: Extension.Account, portfolioId: string, instrumentId?: string): string {
    if (typeof instrumentId !== "undefined" && instrumentId) {
      return `/${account.source.type}/${account.source.id}/portfolio/custom/${portfolioId}/${instrumentId}`;
    }
    return `/${account.source.type}/${account.source.id}/portfolio/custom/${portfolioId}`;
  },

  getManagePortfoliosLink(account: Extension.Account): string {
    return `/${account.source.type}/${account.source.id}/manage-portfolios`;
  },
};
export default LinkFactory;
