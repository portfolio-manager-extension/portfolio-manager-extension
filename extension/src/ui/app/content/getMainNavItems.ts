import LinkFactory from "../../LinkFactory";

export function getMainNavItems(
  locale: Locale,
  currentTab: "welcome" | "changes-log" | "disclaimer" | "how-it-works" | "collected-data" | "terms-of-service"
) {
  const links = LinkFactory.make(locale, false);
  return [
    { url: links.welcome, text: "Welcome", active: currentTab == "welcome" },
    { url: links.disclaimer, text: "Haftungsausschluss / Disclaimer", active: currentTab == "disclaimer" },
    { url: links.howItWorks, text: "How it works", active: currentTab == "how-it-works" },
    { url: links.termsOfService, text: "Terms of service", active: currentTab == "terms-of-service" },
    { url: links.collectedData, text: "Collected data and reasons", active: currentTab == "collected-data" },
    { url: links.changesLog, text: "Changes Log", active: currentTab == "changes-log" },
  ];
}
