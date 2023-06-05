import { CUSTOM_EVENT_SETTINGS_CHANGED } from "../const";

export const UIEventDispatcher: UI.Dispatcher = {
  dispatchAccountsChanged(accounts: Extension.Account[]): void {
    chrome.runtime.sendMessage({
      type: "extension-event:on-accounts-changed",
      payload: accounts,
    });
  },

  dispatchSettingsChanged(settings: Extension.Settings): void {
    chrome.runtime.sendMessage({
      type: "extension-event:on-settings-changed",
      payload: settings,
    });
    document.dispatchEvent(
      new CustomEvent(CUSTOM_EVENT_SETTINGS_CHANGED, {
        detail: settings,
      })
    );
  },

  openApp(account: Extension.Account) {
    chrome.runtime.sendMessage({
      type: "tab:open-app",
      payload: {
        account: account,
      },
    });
  },

  openTradeRepublic(account: Extension.Account) {
    chrome.runtime.sendMessage({
      type: "tab:open-trade-republic",
      payload: {
        account: account,
      },
    });
  },

  openLink(url: string) {
    chrome.runtime.sendMessage({
      type: "tab:open-link-in-new-tab",
      payload: {
        url: url,
      },
    });
  },

  registerTab(type: Background.TabType, account: Extension.Account | undefined) {
    chrome.runtime.sendMessage({
      type: "tab:register",
      payload: {
        type,
        account: account,
      },
    });
  },

  removeTab() {
    chrome.runtime.sendMessage({
      type: "tab:remove",
    });
  },

  updateCurrentAccountOfTab(account: Extension.Account | undefined) {
    chrome.runtime.sendMessage({
      type: "tab:update-current-account",
      payload: {
        account,
      },
    });
  },

  reprocessMessage(account: Extension.Account, messageId: string) {
    chrome.runtime.sendMessage({
      type: "data:reprocess-message",
      payload: {
        account: account,
        messageId: messageId,
      },
    });
  },
};

export default UIEventDispatcher;
