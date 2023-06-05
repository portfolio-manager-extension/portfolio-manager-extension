import { CUSTOM_EVENT_SETTINGS_CHANGED } from "../const";

export const UIEventListener: UI.Listener = {
  onAccountsChangedListener(cb: (accounts: Extension.Account[], sender?: MessageSender) => void): () => void {
    const handler = (msg: any, sender: any) => {
      if (typeof msg.type != "undefined") {
        if (msg.type == "extension-event:on-accounts-changed") {
          cb.call(undefined, msg.payload, sender);
        }
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return function () {
      chrome.runtime.onMessage.removeListener(handler);
    };
  },

  onSettingsChangedListener(cb: (settings: Extension.Settings, sender?: MessageSender) => void): () => void {
    const extensionHandler = (msg: any, sender: any) => {
      if (typeof msg.type != "undefined") {
        if (msg.type == "extension-event:on-settings-changed") {
          cb.call(undefined, msg.payload, sender);
        }
      }
    };
    chrome.runtime.onMessage.addListener(extensionHandler);

    const customEventHandler = function (e: CustomEvent) {
      cb.call(undefined, Object.assign({}, e.detail), undefined);
    };
    // @ts-ignore
    document.addEventListener(CUSTOM_EVENT_SETTINGS_CHANGED, customEventHandler);

    return function () {
      chrome.runtime.onMessage.removeListener(extensionHandler);
      // @ts-ignore
      document.removeEventListener(CUSTOM_EVENT_SETTINGS_CHANGED, customEventHandler);
    };
  },
};

export default UIEventListener;
