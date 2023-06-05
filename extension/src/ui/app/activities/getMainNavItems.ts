import LinkFactory from "../../LinkFactory";

export function getMainNavItems(
  account: Extension.Account,
  currentTab: "overview" | "trading" | "saving-plans-executed" | "cash-in-n-out" | "dividend" | "interest"
) {
  return [
    // { url: "", text: "Overview", active: currentTab == "overview" },
    { url: LinkFactory.getActivityTradingPage(account), text: "Trading", active: currentTab == "trading" },
    // { url: "", text: "Saving Plans Executed", active: currentTab == "saving-plans-executed" },
    { url: LinkFactory.getActivityDividendPage(account), text: "Dividend", active: currentTab == "dividend" },
    { url: LinkFactory.getActivityInterestPage(account), text: "Interest", active: currentTab == "interest" },
    { url: LinkFactory.getActivityCashFlowPage(account), text: "Cash In & Out", active: currentTab == "cash-in-n-out" },
  ];
}
