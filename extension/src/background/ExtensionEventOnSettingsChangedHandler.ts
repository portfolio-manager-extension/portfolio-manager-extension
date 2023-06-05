export class ExtensionEventOnSettingsChangedHandler implements ExtensionEvent.OnSettingsChanged.Handler {
  readonly type = "extension-event:on-settings-changed";
  private tabManager: Background.TabManager;
  private sender: Background.MessageSender;

  constructor(tabManager: Background.TabManager, sender: Background.MessageSender) {
    this.tabManager = tabManager;
    this.sender = sender;
  }

  async execute(message: ExtensionEvent.OnSettingsChanged.Message, sender: MessageSender): Promise<undefined> {
    this.tabManager.broadcast((tab) => {
      if (typeof sender.tab !== "undefined" && typeof sender.tab.id !== "undefined" && tab.tabId == sender.tab.id) {
        // do not broadcast back to an extension which trigger an event
        return;
      }
      try {
        this.sender.sendToTab(tab.tabId, message);
      } catch (error) {
        console.debug("Got error when trying to broadcast, probably an unload event is not triggered");
      }
    });
    return undefined;
  }
}
