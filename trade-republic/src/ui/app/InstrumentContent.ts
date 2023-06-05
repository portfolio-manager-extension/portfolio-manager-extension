import { Component, ComponentChild, h, RenderableProps } from "preact";
import MainNav from "./MainNav";
import TradeHistory from "./TradeHistory";

type Props = {
  account: Extension.Account;
  instrumentId: string;
};

type State = {
  selectedMenu: "trade-history";
};

export default class InstrumentContent extends Component<Props, State> {
  state: State = {
    selectedMenu: "trade-history",
  };

  render(props: RenderableProps<Props> | undefined, state: Readonly<State> | undefined, context: any): ComponentChild {
    const content = h(
      "div",
      { id: "pme-main" },
      h(TradeHistory, { account: this.props.account, instrumentId: this.props.instrumentId })
    );

    return h("div", { className: "pme-content-container" }, h(MainNav, { selected: this.state.selectedMenu }), content);
  }
}
