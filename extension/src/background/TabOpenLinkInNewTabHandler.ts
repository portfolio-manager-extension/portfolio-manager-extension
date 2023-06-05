export class TabOpenLinkInNewTabHandler implements Tab.OpenLinkInNewTab.Handler {
  readonly type = "tab:open-link-in-new-tab";
  private tabManager: Background.TabManager;

  constructor(tabManager: Background.TabManager) {
    this.tabManager = tabManager;
  }

  async execute(message: Tab.OpenLinkInNewTab.Message, sender: MessageSender): Promise<undefined> {
    await chrome.tabs.create({ url: message.payload.url });

    return undefined;
  }
}
