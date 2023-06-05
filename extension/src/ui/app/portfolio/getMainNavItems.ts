import LinkFactory from "../../LinkFactory";

export function getMainNavItems(account: Extension.Account, portfolios: CustomEntity.Portfolio[], currentTab: string) {
  const result = [
    {
      url: LinkFactory.getPortfolioAllPositionsLink(account),
      text: "All Positions",
      active: currentTab == "all-positions",
    },
  ];
  portfolios.forEach(function (portfolio) {
    result.push({
      url: LinkFactory.getPortfolioLink(account, portfolio.id),
      text: portfolio.name,
      active: currentTab == portfolio.id,
    });
  });
  return result;
}
