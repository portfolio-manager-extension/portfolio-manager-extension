import { AccountCheckAvailabilityHandler } from "./AccountCheckAvailabilityHandler";
import { AccountSetupHandler } from "./AccountSetupHandler";
import { MessageSender } from "./MessageSender";
import { MessageRouter } from "./MessageRouter";
import { TradeRepublicManager } from "./TradeRepublicManager";
import { TradeRepublicPageStartHandler } from "./TradeRepublicPageStartHandler";
import { TradeRepublicPageStopHandler } from "./TradeRepublicPageStopHandler";
import { TradeRepublicCaptureMessageHandler } from "./TradeRepublicCaptureMessageHandler";
import { TradeRepublicStartConsumeMessagesHandler } from "./TradeRepublicStartConsumeMessagesHandler";
import { TabManager } from "./TabManager";
import { ExtensionRepository } from "../storage/ExtensionRepository";
import { TabRegisterHandler } from "./TabRegisterHandler";
import { TabRemoveHandler } from "./TabRemoveHandler";
import { TabUpdateCurrentAccountHandler } from "./TabUpdateCurrentAccountHandler";
import { TabOpenTradeRepublicHandler } from "./TabOpenTradeRepublicHandler";
import { TabOpenAppHandler } from "./TabOpenAppHandler";
import { TabOpenLinkInNewTabHandler } from "./TabOpenLinkInNewTabHandler";
import { TradeRepublicMessageConsumer } from "./TradeRepublicMessageConsumer";
import { ExtensionEventOnSettingsChangedHandler } from "./ExtensionEventOnSettingsChangedHandler";
import { ProcessorManager } from "../processor/ProcessorManager";
import { TradeRepublicGetTradeHistoryDataHandler } from "./TradeRepublicGetTradeHistoryDataHandler";
import StorageFactory from "../storage/StorageFactory";

const sender = new MessageSender();
const router = new MessageRouter();
const tabManager = new TabManager();
const extensionRepository = new ExtensionRepository();
const processorManager = new ProcessorManager(StorageFactory);
const messageConsumer = new TradeRepublicMessageConsumer(StorageFactory, processorManager);
const tradeRepublicManager = new TradeRepublicManager(sender, extensionRepository, tabManager, messageConsumer);

router
  .register(new TradeRepublicCaptureMessageHandler(tradeRepublicManager))
  .register(new TradeRepublicPageStartHandler(tradeRepublicManager))
  .register(new TradeRepublicStartConsumeMessagesHandler(tradeRepublicManager))
  .register(new TradeRepublicPageStopHandler(tradeRepublicManager))
  .register(new TradeRepublicGetTradeHistoryDataHandler())
  .register(new AccountCheckAvailabilityHandler(extensionRepository))
  .register(new AccountSetupHandler(extensionRepository))
  .register(new TabRegisterHandler(tabManager))
  .register(new TabRemoveHandler(tabManager))
  .register(new TabUpdateCurrentAccountHandler(tabManager))
  .register(new TabOpenTradeRepublicHandler(tabManager))
  .register(new TabOpenAppHandler(tabManager))
  .register(new TabOpenLinkInNewTabHandler(tabManager))
  .register(new ExtensionEventOnSettingsChangedHandler(tabManager, sender));

chrome.webRequest.onBeforeRequest.addListener(
  function ({ tabId, url }) {
    if (url.endsWith("api/v2/auth/account")) {
      tradeRepublicManager.onBeforeAccountRequest(tabId);
    }
  },
  { urls: ["*://api.traderepublic.com/*"] }
);

chrome.tabs.onRemoved.addListener((tabId) => {
  tradeRepublicManager.onTabRemoved(tabId);
  tabManager.remove(tabId);
});
