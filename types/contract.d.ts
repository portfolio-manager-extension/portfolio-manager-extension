declare namespace Account {
  namespace CheckAvailability {
    type Payload = {
      source: Extension.IAccountSource;
      locale: Locale;
    };
    type Result = Extension.Account | undefined;
    type Message = IMessage<"account:check-availability", Payload>;
    type Handler = IMessageHandler<"account:check-availability", Payload, Result>;
  }

  namespace Setup {
    type Payload = {
      source: Extension.IAccountSource;
      locale: Locale;
      currency: Currency;
    };
    type Result = Extension.Account;
    type Message = IMessage<"account:setup", Payload>;
    type Handler = IMessageHandler<"account:setup", Payload, Result>;
  }
}

declare namespace ExtensionEvent {
  namespace OnAccountsChanged {
    type Message = IMessage<"extension-event:on-accounts-changed", Extension.Account[]>;
    type Handler = IMessageHandler<"extension-event:on-accounts-changed", Extension.Account[], undefined>;
  }

  namespace OnSettingsChanged {
    type Message = IMessage<"extension-event:on-settings-changed", Extension.Settings>;
    type Handler = IMessageHandler<"extension-event:on-settings-changed", Extension.Settings, undefined>;
  }
}

declare namespace Tab {
  namespace Register {
    type Payload = {
      type: "app" | "trade-republic";
      account: Extension.Account | undefined;
    };
    type Message = IMessage<"tab:register", Payload>;
    type Handler = IMessageHandler<"tab:register", Payload, undefined>;
  }

  namespace Remove {
    type Message = IMessage<"tab:remove", undefined>;
    type Handler = IMessageHandler<"tab:remove", undefined, undefined>;
  }

  namespace UpdateCurrentAccount {
    type Payload = {
      account: Extension.Account | undefined;
    };
    type Message = IMessage<"tab:update-current-account", Payload>;
    type Handler = IMessageHandler<"tab:update-current-account", Payload, undefined>;
  }

  namespace OpenTradeRepublic {
    type Payload = {
      account: Extension.Account | undefined;
    };
    type Message = IMessage<"tab:open-trade-republic", Payload>;
    type Handler = IMessageHandler<"tab:open-trade-republic", Payload, undefined>;
  }

  namespace OpenApp {
    type Payload = {
      account: Extension.Account | undefined;
    };
    type Message = IMessage<"tab:open-app", Payload>;
    type Handler = IMessageHandler<"tab:open-app", Payload, undefined>;
  }

  namespace OpenLinkInNewTab {
    type Payload = { url: string };
    type Message = IMessage<"tab:open-link-in-new-tab", Payload>;
    type Handler = IMessageHandler<"tab:open-link-in-new-tab", Payload, undefined>;
  }
}
