export class TabRemoveHandler implements Tab.Remove.Handler {
  readonly type = "tab:remove";
  private tabManager: Background.TabManager;

  constructor(tabManager: Background.TabManager) {
    this.tabManager = tabManager;
  }

  async execute(message: IMessage<"tab:remove", undefined>, sender: MessageSender): Promise<undefined> {
    if (typeof sender.tab != "undefined" && typeof sender.tab.id != "undefined") {
      this.tabManager.remove(sender.tab.id);
    }

    return undefined;
  }
}
