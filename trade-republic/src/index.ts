import { BackgroundCommunicator } from "./BackgroundCommunicator";
import { Helper } from "./Helper";
import { MessageSender } from "./MessageSender";
import { MessageRouter } from "./MessageRouter";
import { RunForMainPageHandler } from "./RunForMainPageHandler";
import { RunForLoginPageHandler } from "./RunForLoginPageHandler";
import { TranslationsFactory } from "./TranslationsFactory";
import { WebsocketMessageFilter } from "./WebsocketMessageFilter";
import UI from "./ui/index";
import WebsocketMessageTypeDetector from "./WebsocketMessageTypeDetector";
import WebsocketMessageParser from "./WebsocketMessageParser";
// ---------------------------------------------------------------------------
// Inject chromium websocket wrapper and forward all message to lib script
// ---------------------------------------------------------------------------
const s = document.createElement("script");
s.src = chrome.runtime.getURL("js/trade-republic-injected.js");
s.onload = function (this: any) {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
// ---------------------------------------------------------------------------
// main entrance of the lib script
// ---------------------------------------------------------------------------
const sender = new MessageSender();
const helper = new Helper();
const communicator = new BackgroundCommunicator(sender);
const typeDetector = new WebsocketMessageTypeDetector(new WebsocketMessageParser());
const websocketMessageFilter = new WebsocketMessageFilter(communicator, typeDetector, helper);
const router = new MessageRouter();
const translationsFactory = new TranslationsFactory();
const ui = new UI(translationsFactory);

const runForMainPageHandler = new RunForMainPageHandler();
const runForLoginPageHandler = new RunForLoginPageHandler();

runForLoginPageHandler.do(async (settings: Extension.Settings) => {
  console.debug("Start running for login page");
  ui.useSettings(settings);
  ui.renderLoginBanner(helper.readLocale());
  helper.applySettings(settings);
});

runForMainPageHandler.do(async (settings: Extension.Settings) => {
  console.debug("Start running for main page");
  ui.useSettings(settings);
  ui.removeLoginBanner();
  helper.applySettings(settings);
  helper
    .fetchAccount()
    .then(async function (account: TradeRepublic.Account) {
      const source: Extension.IAccountSource = {
        type: "trade-republic",
        id: account.personId,
        name: account.name,
        email: account.email.address,
      };
      const currency = helper.findCurrency(account.jurisdiction);

      const locale = helper.readLocale();
      const result = await communicator.checkAvailability(source, locale);
      if (!result) {
        ui.renderSetupBanner(source, locale, currency);
        communicator.sendPageStopSignal();
        websocketMessageFilter.disableSendToBackground();
        return;
      }

      ui.renderApp(result, communicator);
      communicator.sendStartConsumeMessagesSignal(result);
      const taxInformation = await helper.fetchTaxInformation();
      const message: TradeRepublic.FilteredMessage = {
        received: JSON.stringify(taxInformation),
        sent: "",
        type: "tax-information",
        locale: helper.readLocale(),
      };
      communicator.sendFilteredMessage(message);
    })
    .catch(function () {
      communicator.sendPageStopSignal();
    });
});

router.register(runForLoginPageHandler).register(runForMainPageHandler);

communicator.sendPageStartSignal();

(function () {
  window.addEventListener("unload", function () {
    try {
      communicator.sendPageStopSignal();
    } catch (error) {}
  });
})();
