import LinkFactory from "../../LinkFactory";

export function getMainNavItems(
  account: Extension.Account,
  currentTab: "raw-messages" | "processed-data" | "custom-data" | "import" | "export" | "account"
) {
  return [
    { url: LinkFactory.getRawMessagesPage(account), text: "Raw Messages", active: currentTab == "raw-messages" },
    // { url: LinkFactory.getProcessedDataPage(account), text: "Processed Data", active: currentTab == "processed-data" },
    // { url: "", text: "Custom Data", active: currentTab == "custom-data" },
    { url: LinkFactory.getExportPage(account), text: "Export", active: currentTab == "export" },
    { url: LinkFactory.getImportPage(account), text: "Import", active: currentTab == "import" },
    { url: LinkFactory.getAccountPage(account), text: "Account", active: currentTab == "account" },
  ];
}
