import { Component, ComponentChild, h, RenderableProps } from "preact";
import TransactionSellRow from "./TransactionSellRow";
import TransactionBuyRow from "./TransactionBuyRow";

type Props = {
  transactions: Service.Transaction[];
};

type State = {
  showHolding: boolean;
};

type Item = {
  index: number;
  transaction: Service.Transaction | null;
};

export default class TransactionsTable extends Component<Props, State> {
  state: State = {
    showHolding: false,
  };

  buildItems(): Item[] {
    const groupedIndex = this.props.transactions.findIndex(function (item) {
      return item.type == "buy" && item.remaining > 0;
    });
    if (groupedIndex <= 0) {
      return this.props.transactions.map(function (transaction, index) {
        return {
          index: index,
          transaction: transaction,
        };
      });
    }

    const result: Item[] = [];
    let index = this.state.showHolding ? 0 : groupedIndex;
    this.props.transactions.forEach((transaction, i) => {
      if (i == groupedIndex) {
        result.push({ index: index, transaction: null });
        result.push({ index: index, transaction: transaction });
        index++;
        return;
      }

      if (this.state.showHolding || i > groupedIndex) {
        result.push({ index: index, transaction: transaction });
        index++;
      }
    });
    return result;
  }

  toggleShowHolding() {
    this.setState({ showHolding: !this.state.showHolding });
  }

  render(props: RenderableProps<Props> | undefined, state: Readonly<State> | undefined, context: any): ComponentChild {
    const items = this.buildItems();
    const hiddenCount = Math.max(0, this.props.transactions.length - items.length) + 1;

    return h(
      "table",
      { id: "pme-transactions-table" },
      h(
        "thead",
        null,
        h("tr", null, [
          h("th", { className: "column-index" }),
          h("th", { className: "column-time" }, "Time"),
          h("th", { className: "column-desc" }, ""),
          h("th", { className: "column-price" }, "Price"),
          h("th", { className: "column-fee" }, "Fee"),
          h("th", { className: "column-amount" }, "Amount"),
          h("th", { className: "column-status" }, "Status"),
        ])
      ),
      h(
        "tbody",
        null,
        items.map((item, key) => {
          if (item.transaction == null) {
            if (this.state.showHolding) {
              return h(
                "tr",
                { className: "action-row", key: key },
                h(
                  "td",
                  { colSpan: 7 },
                  h(
                    "a",
                    { onClick: () => this.toggleShowHolding() },
                    "Hide all transactions above which are not related to current holding."
                  )
                )
              );
            }
            return h(
              "tr",
              { className: "action-row", key: key },
              h(
                "td",
                { colSpan: 7 },
                "There are ",
                hiddenCount,
                " transactions which are not related to current holding, ",
                h("a", { onClick: () => this.toggleShowHolding() }, "show all of them")
              )
            );
          }

          if (item.transaction.type == "buy") {
            return h(TransactionBuyRow, { transaction: item.transaction, index: item.index, key: key });
          }
          return h(TransactionSellRow, { transaction: item.transaction, index: item.index, key: key });
        })
      )
    );
  }
}
