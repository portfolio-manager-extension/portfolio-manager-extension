import { createElement, render } from "preact/compat";
import LoginBanner from "./LoginBanner";
import SetupBanner from "./SetupBanner";
import App from "./App";

const CSS_LINK_ID = "trade-republic-pme";
const SETUP_WRAPPER_ID = "trade-republic-pme-setup";
const APP_WRAPPER_ID = "trade-republic-pme-app";
const LOGIN_WRAPPER_ID = "trade-republic-pme-login";

export default class UI implements TradeRepublic.UI {
  private settings: Extension.Settings | undefined;
  private translationsFactory: TradeRepublic.TranslationsFactory;

  constructor(translationsFactory: TradeRepublic.TranslationsFactory) {
    this.translationsFactory = translationsFactory;
  }

  useSettings(settings: Extension.Settings) {
    this.settings = settings;
  }

  getVersion(): string {
    if (!this.settings) {
      return "";
    }
    return this.settings.version;
  }

  injectCss() {
    let link = document.querySelector(`#${CSS_LINK_ID}`);
    if (!link) {
      link = document.createElement("link");
      link.id = CSS_LINK_ID;
      link.setAttribute("type", "text/css");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", chrome.runtime.getURL("css/trade-republic.css"));

      document.head.appendChild(link);
    }
  }

  createWrapper(id: string): Element {
    let wrapper = document.querySelector(`#${id}`);
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = id;
      wrapper.classList.add("pme-app");
      document.body.appendChild(wrapper);
    }
    return wrapper;
  }

  removeWrapper(id: string) {
    const wrapper = document.querySelector(`#${id}`);
    if (wrapper) {
      wrapper.remove();
    }
  }

  removeLoginBanner() {
    this.removeWrapper(LOGIN_WRAPPER_ID);
  }

  renderApp(account: Extension.Account, communicator: TradeRepublic.BackgroundCommunicator) {
    this.injectCss();
    const wrapper = this.createWrapper(APP_WRAPPER_ID);
    const component = createElement(App, {
      version: this.getVersion(),
      account: account,
      translations: this.translationsFactory.make(account.locale),
    });
    render(component, wrapper);
  }

  renderLoginBanner(locale: Locale) {
    this.injectCss();
    const wrapper = this.createWrapper(LOGIN_WRAPPER_ID);
    const component = createElement(LoginBanner, {
      version: this.getVersion(),
      locale,
      translations: this.translationsFactory.make(locale),
    });
    render(component, wrapper);
  }

  renderSetupBanner(account: Extension.IAccountSource, locale: Locale, currency: Currency) {
    this.injectCss();
    const translations = this.translationsFactory.make(locale);
    const wrapper = this.createWrapper(SETUP_WRAPPER_ID);
    const component = createElement(SetupBanner, {
      version: this.getVersion(),
      account: account,
      locale: locale,
      currency: currency,
      translations: this.translationsFactory.make(locale),
    });
    render(component, wrapper);
  }
}
