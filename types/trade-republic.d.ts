declare namespace TradeRepublic {
  type Account = {
    personId: string;
    name: { first: string; last: string };
    email: { address: string; verified: boolean };
    taxExemptionOrder?: {
      applied: number;
      current: number;
      maximum: number;
      minimum: number;
      syncStatus: string;
      validFrom: string;
      validUntil: string | null;
    };
    jurisdiction: string;
  };

  type TaxInformation = {
    fsaApplied: number;
    fsaRemaining: number;
    fsaUsed: number;
    lossSetOffOthers: number;
    lossSetOffStocks: number;
    lossSetOffWithholdingTax: number;
    lossSetOffWithholdingTaxOptimisation: string;
    signFsaUsed: string;
    taxAssessment: string;
  };

  interface Helper {
    fetchAccount(): Promise<Account>;
    fetchTaxInformation(): Promise<TaxInformation>;
    readLocale(): Locale;
    applySettings(settings: Extension.Settings): void;
    findCurrency(jurisdiction: string): Currency;
  }

  interface UI {
    useSettings(settings: Extension.Settings): void;
    injectCss(): void;
    removeLoginBanner(): void;
    renderSetupBanner(account: Extension.IAccountSource, locale: Locale, currency: Currency): void;
    renderApp(account: Extension.Account, communicator: TradeRepublic.BackgroundCommunicator): void;
    renderLoginBanner(locale: Locale): void;
  }

  interface MessageSender {
    send(message: TradeRepublic.PageStart.Message): Promise<undefined>;
    send(message: TradeRepublic.PageStop.Message): Promise<undefined>;
    send(message: TradeRepublic.CaptureMessage.Message): Promise<void>;
    send(message: TradeRepublic.StartConsumeMessages.Message): Promise<void>;
    send(message: TradeRepublic.GetTradeHistoryData.Message): Promise<TradeRepublic.GetTradeHistoryData.Response>;
    send(message: Account.CheckAvailability.Message): Promise<Account.CheckAvailability.Result>;
    send(message: Account.Setup.Message): Promise<Account.Setup.Result>;
    send(message: Tab.OpenApp.Message): Promise<undefined>;
    send(message: Tab.OpenLinkInNewTab.Message): Promise<undefined>;
  }

  interface MessageRouter {
    register(handler: TradeRepublic.RunForMainPage.Handler): this;
    register(handler: TradeRepublic.RunForLoginPage.Handler): this;
  }

  interface BackgroundCommunicator {
    sendPageStartSignal(): any;
    sendPageStopSignal(): any;
    sendStartConsumeMessagesSignal(account: Extension.Account): void;
    checkAvailability(account: Extension.IAccountSource, locale: Locale): Promise<Account.CheckAvailability.Result>;
    setupAccount(account: Extension.IAccountSource, locale: Locale, currency: Currency): Promise<Account.Setup.Result>;
    sendFilteredMessage(filteredMessage: FilteredMessage): void;
    openLinkInNewTab(url: string): void;
    openApp(account: Extension.Account | undefined): void;
    getTradeHistoryData(
      account: Extension.Account,
      instrumentId: string
    ): Promise<TradeRepublic.GetTradeHistoryData.Response>;
  }

  namespace PageStart {
    type Message = IMessage<"trade-republic:page-start", undefined>;
    type Handler = IMessageHandler<"trade-republic:page-start", undefined, undefined>;
  }

  namespace PageStop {
    type Message = IMessage<"trade-republic:page-stop", undefined>;
    type Handler = IMessageHandler<"trade-republic:page-stop", undefined, undefined>;
  }

  namespace StartConsumeMessages {
    type Payload = Extension.Account;
    type Message = IMessage<"trade-republic:start-consume-messages", Payload>;
    type Handler = IMessageHandler<"trade-republic:start-consume-messages", Payload, undefined>;
  }

  namespace CaptureMessage {
    type Message = IMessage<"trade-republic:capture-message", FilteredMessage>;
    type Handler = IMessageHandler<"trade-republic:capture-message", FilteredMessage, undefined>;
  }

  namespace RunForMainPage {
    type Message = IMessage<"trade-republic:run-for-main-page", Extension.Settings>;
    type Handler = IMessageHandler<"trade-republic:run-for-main-page", Extension.Settings, undefined>;
  }

  namespace RunForLoginPage {
    type Message = IMessage<"trade-republic:run-for-login-page", Extension.Settings>;
    type Handler = IMessageHandler<"trade-republic:run-for-login-page", Extension.Settings, undefined>;
  }

  namespace GetTradeHistoryData {
    type Payload = { account: Extension.Account; instrumentId: string };
    type Response = Service.TradeHistoryData | null;
    type Message = IMessage<"trade-republic:get-trade-history-data", Payload>;
    type Handler = IMessageHandler<"trade-republic:get-trade-history-data", Payload, Response>;
  }

  type MessageType =
    | "realtime-ticker"
    | "exchange-info"
    | "timeline-events"
    | "saving-plans"
    | "positions"
    | "timeline-event-detail"
    | "instrument-info"
    | "cash"
    | "available-cash"
    | "tax-information" // this collected from XHR but use still use message to send to background
    | "unknown";

  type FilteredMessage = {
    received: string;
    sent: string;
    locale: Locale;
    type: MessageType;
  };

  interface WebsocketMessageFilter {
    disableSendToBackground(): void;
    isParsableMessage(raw: string): boolean;
    shouldSendToBackground(messageType: MessageType): boolean;
  }

  type DetectTypeResult = {
    valid: boolean;
    type: MessageType;
    source: "sent-data" | "input";
    data: any;
    sentData: any;
  };

  interface WebsocketMessageTypeDetector {
    detect(url: string, input: string): DetectTypeResult;
  }

  type WebsocketSubMessageResult = {
    valid: boolean;
    messageId: string;
    data: any;
  };

  type WebsocketUnsubMessageResult = {
    valid: boolean;
    messageId: string;
  };

  type WebsocketResponseMessageResult = {
    valid: boolean;
    messageId: string;
    data: any;
  };

  interface WebsocketMessageParser {
    parseSubMessage(input: string): WebsocketSubMessageResult;
    parseUnsubMessage(input: string): WebsocketUnsubMessageResult;
    parseResponseMessage(input: string): WebsocketResponseMessageResult;
  }

  type WebsocketTimelineResponse = {
    cursors?: { before: string; after?: string };
    data: Array<TimelineEvent | TimelineAccountBalance>;
  };

  type TimelineEvent = {
    type: "timelineEvent";
    data: {
      id: string;
      cashChangeAmount?: number;
      icon: string;
      month: string;
      title: string;
      body: string;
      attributes: any[];
      timestamp: number;
    };
  };

  type TimelineAccountBalance = {
    type: "timelineAccountBalance";
    data: {
      id: string;
      title: string;
      items: Array<{
        title: string;
        detail: number;
      }>;
      totalChange: {
        absolute: number;
        relative: number;
        title: string;
      };
      timestamp: number;
    };
  };

  type TimelineItem = TimelineEvent | TimelineAccountBalance;

  type TimelineDetail = {
    id: string;
    sections: TimelineDetailSection[];
    titleText: string;
    subtitleText: string;
  };

  type TimelineDetailSectionDataItem = {
    title: string;
    detail: DetailTypeText | DetailTypeDecimal | DetailTypeCurrency | DetailTypePercentage;
  };

  type TimelineDetailSection = {
    title: string;
    type: string;
    data: Array<TimelineDetailSectionDataItem>;
  };

  type DetailTypeText = { type: "text"; text: string };
  type DetailTypeDecimal = { type: "decimal"; value: number; fractionDigits: number };
  type DetailTypePercentage = { type: "percentage"; value: number; fractionDigits: number };
  type DetailTypeCurrency = { type: "currency"; currencyId: Currency; value: number; fractionDigits: number };

  type PositionItem = {
    instrumentId: string;
    netSize: string;
    averageBuyIn: string;
  };

  type TickerValue = {
    time: number;
    price: string;
    size: number;
  };

  type TickerResponse = {
    ask: TickerValue;
    bid: TickerValue;
    last: TickerValue;
    open: TickerValue;
    pre: TickerValue;
    qualityId: string;
    delta: string | null;
    leverage: any;
  };

  type TickerRequest = {
    type: "ticker";
    id: string;
  };

  type Translations = {
    appBanner: {
      btnText: string;
    };
    loginPageBanner: {
      pleaseLoginText: string;
    };
    setUpBanner: {
      btnText: string;
    };
    privacy: {
      smallBannerText: string;
    };
    help: {
      howItWorkText: string;
      howItWorkLink: string;
    };
  };

  interface TranslationsFactory {
    make(locale: Locale): Translations;
  }
}
