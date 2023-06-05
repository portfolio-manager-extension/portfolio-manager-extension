import { Component, ComponentChild, h, RenderableProps } from "preact";
import Header from "./components/Header";
import HowItWorkLink from "./components/HowItWorkLink";
import { MessageSender } from "../MessageSender";
import { BackgroundCommunicator } from "../BackgroundCommunicator";

type Props = {
  version: string;
  account: Extension.IAccountSource;
  locale: Locale;
  currency: Currency;
  translations: TradeRepublic.Translations;
};

type State = {
  isMinimized: boolean;
};

export default class SetupBanner extends Component<Props, State> {
  state = {
    isMinimized: false,
  };

  onMinimizedToggle() {
    const isMinimized = !this.state.isMinimized;
    if (isMinimized) {
      document.body.classList.add("minimized-pme");
    } else {
      document.body.classList.remove("minimized-pme");
    }

    this.setState(Object.assign({}, this.state, { isMinimized: isMinimized }));
  }

  async onSetupClick() {
    const sender = new MessageSender();
    const communicator = new BackgroundCommunicator(sender);
    await communicator.setupAccount(this.props.account, this.props.locale, this.props.currency);
    document.location.reload();
  }

  render(props: RenderableProps<Props> | undefined, state: Readonly<State> | undefined, context: any): ComponentChild {
    return Header({
      account: undefined,
      version: this.props.version,
      isMinimized: this.state.isMinimized,
      onMinimizedToggle: () => this.onMinimizedToggle(),
      children: this.state.isMinimized ? null : this.renderHeaderChildren(),
    });
  }

  renderHeaderChildren(): ComponentChild {
    return h(
      "div",
      { className: "pme-setup-container" },
      h(
        "div",
        { className: "pme-setup-text" },
        this.props.translations.privacy.smallBannerText,
        h("br", null),
        h(HowItWorkLink, { locale: this.props.locale, text: this.props.translations.help.howItWorkText, icon: true })
      ),
      h(
        "div",
        { className: "pme-setup-button-wrapper" },
        h(
          "button",
          { className: "setup-btn btn-primary", onClick: () => this.onSetupClick() },
          this.props.translations.setUpBanner.btnText
        )
      )
    );
  }
}
