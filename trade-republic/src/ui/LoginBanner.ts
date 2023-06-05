import { Component, ComponentChild, Fragment, h, RenderableProps } from "preact";
import Header from "./components/Header";
import HowItWorkLink from "./components/HowItWorkLink";

type Props = {
  version: string;
  locale: Locale;
  translations: TradeRepublic.Translations;
};

type State = {
  isMinimized: boolean;
};

export default class LoginBanner extends Component<Props, State> {
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
      Fragment,
      null,
      this.props.translations.loginPageBanner.pleaseLoginText,
      " ",
      this.props.translations.privacy.smallBannerText,
      h("br", null),
      h(HowItWorkLink, { locale: this.props.locale, text: this.props.translations.help.howItWorkText, icon: true })
    );
  }
}
