export class TabUpdateCurrentAccountHandler implements Tab.UpdateCurrentAccount.Handler {
  readonly type = "tab:update-current-account";
  private tabManager: Background.TabManager;

  constructor(tabManager: Background.TabManager) {
    this.tabManager = tabManager;
  }

  async execute(
    message: IMessage<"tab:update-current-account", Tab.UpdateCurrentAccount.Payload>,
    sender: MessageSender
  ): Promise<undefined> {
    if (typeof sender.tab != "undefined" && typeof sender.tab.id != "undefined") {
      this.tabManager.updateCurrentAccount(sender.tab.id, message.payload.account);
    }

    return undefined;
  }
}
