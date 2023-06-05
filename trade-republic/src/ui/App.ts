import { Component, ComponentChild, Fragment, h, RenderableProps } from "preact";
import Header from "./components/Header";
import CollectDataButton from "./app/CollectDataButton";
import InstrumentContent from "./app/InstrumentContent";
import HowItWorkLink from "./components/HowItWorkLink";
import { parseUrl } from "./fn/parseUrl";

type Props = {
  account: Extension.Account;
  version: string;
  translations: TradeRepublic.Translations;
};

type State = {
  isMinimized: boolean;
  page: "login" | "home" | "instrument" | "unknown";
  instrumentId?: string;
};

export default class App extends Component<Props, State> {
  state: State = {
    isMinimized: false,
    page: "unknown",
  };
  private interval: any | null = null;
  private currentLocation: string = "";

  onMinimizedToggle() {
    const isMinimized = !this.state.isMinimized;
    if (isMinimized) {
      document.body.classList.add("minimized-pme");
    } else {
      document.body.classList.remove("minimized-pme");
    }

    this.setState(Object.assign({}, this.state, { isMinimized: isMinimized }));
  }

  parseLocation() {
    if (location.href != this.currentLocation) {
      this.currentLocation = location.href;
      const result = parseUrl(this.currentLocation);
      this.setState(Object.assign({}, this.state, result));
    }
  }

  componentWillMount() {
    this.interval = setInterval(() => this.parseLocation(), 100);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  render(props: RenderableProps<Props> | undefined, state: Readonly<State> | undefined, context: any): ComponentChild {
    return h(
      Fragment,
      null,
      Header({
        account: this.props.account,
        version: this.props.version,
        isMinimized: this.state.isMinimized,
        onMinimizedToggle: () => this.onMinimizedToggle(),
        children: this.state.isMinimized ? null : this.renderHeaderChildren(),
      }),
      !this.state.isMinimized && this.renderContent()
    );
  }

  renderHeaderChildren(): ComponentChild {
    if (this.state.page == "login") {
      return this.renderHeaderChildrenForLoginPage();
    }

    return h(
      "div",
      { className: "pme-app-header-container" },
      h(
        "div",
        { className: "pme-app-header-text" },
        `You can click "Collect data automatically" button to start collecting data or select an instrument you will see transactions.`
      ),
      h("div", { className: "pme-collect-data-wrapper" }, h(CollectDataButton, {}))
    );
  }

  renderHeaderChildrenForLoginPage(): ComponentChild {
    return h(
      Fragment,
      null,
      this.props.translations.loginPageBanner.pleaseLoginText,
      " ",
      this.props.translations.privacy.smallBannerText,
      h("br", null),
      h(HowItWorkLink, {
        locale: this.props.account.locale,
        text: this.props.translations.help.howItWorkText,
        icon: true,
      })
    );
  }

  renderContent(): ComponentChild {
    if (this.state.page == "instrument" && typeof this.state.instrumentId !== "undefined") {
      return h(InstrumentContent, { account: this.props.account, instrumentId: this.state.instrumentId });
    }
    return null;
  }
}
