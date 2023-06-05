import { Component, ComponentChild, h, RenderableProps } from "preact";
import { BackgroundCommunicator } from "../../BackgroundCommunicator";
import { MessageSender } from "../../MessageSender";
import TransactionsTable from "./TransactionsTable";
import Block from "./Block";
import Performance from "./Performance";
import CurrentPrice from "./CurrentPrice";

type Props = {
  account: Extension.Account;
  instrumentId: string;
};

type State = {
  loading: boolean;
  data: Service.TradeHistoryData | null;
};

export default class TradeHistory extends Component<Props, State> {
  private interval: any | null = null;
  state: State = {
    loading: true,
    data: null,
  };

  async fetchData() {
    const sender = new MessageSender();
    const communicator = new BackgroundCommunicator(sender);
    const result = await communicator.getTradeHistoryData(this.props.account, this.props.instrumentId);
    this.setState({ loading: false, data: result });
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillMount() {
    this.interval = setInterval(() => this.fetchData(), 3000);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  render(props: RenderableProps<Props> | undefined, state: Readonly<State> | undefined, context: any): ComponentChild {
    if (this.state.loading) {
      return h("div", { style: { textAlign: "center" } }, "...loading...");
    }

    if (this.state.data == null) {
      return h("div", { style: { textAlign: "center" } }, "There is no trade history data.");
    }

    return h("div", { id: "pme-trade-history" }, [
      h(
        "div",
        { className: "pme-left-container" },
        h(Block, {
          title: "Transactions",
          content: h(TransactionsTable, { transactions: this.state.data.transactions }),
        })
      ),
      h("div", { className: "pme-right-container" }, [
        h(Performance, { data: this.state.data }),
        h(CurrentPrice, { data: this.state.data }),
      ]),
    ]);
  }
}
