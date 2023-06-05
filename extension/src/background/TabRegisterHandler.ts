export class TabRegisterHandler implements Tab.Register.Handler {
  readonly type = "tab:register";
  private tabManager: Background.TabManager;

  constructor(tabManager: Background.TabManager) {
    this.tabManager = tabManager;
  }

  async execute(message: IMessage<"tab:register", Tab.Register.Payload>, sender: MessageSender): Promise<undefined> {
    if (typeof sender.tab != "undefined" && typeof sender.tab.id != "undefined") {
      this.tabManager.register(sender.tab.id, message.payload.type, message.payload.account);
    }

    return undefined;
  }
}
