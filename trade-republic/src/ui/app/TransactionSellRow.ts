import { h } from "preact";

type Props = {
  transaction: Service.Transaction;
  index: number;
};

export default function TransactionSellRow({ transaction, index }: Props) {
  let status = null;
  if (transaction.profit.netAbsolute.value > 0) {
    status = h(
      "td",
      { className: "cell-status" },
      h(
        "span",
        { className: "performance -positive" },
        `Gain ${transaction.profit.netAbsolute.text} · ${transaction.profit.netPercentage.text}`
      )
    );
  } else {
    status = h(
      "td",
      { className: "cell-status" },
      h(
        "span",
        { className: "performance -negative" },
        `Loss ${transaction.profit.netAbsolute.text} · ${transaction.profit.netPercentage.text}`
      )
    );
  }

  return h("tr", { key: index }, [
    h("td", { className: "cell-index" }, index + 1),
    h("td", { className: "cell-time" }, transaction.time),
    h("td", { className: "cell-desc" }, `Sell ${transaction.quantity}`),
    h("td", { className: "cell-price" }, transaction.price.text),
    h("td", { className: "cell-fee" }, transaction.fee.value == 0 ? "-" : transaction.fee.text),
    h("td", { className: "cell-amount" }, transaction.amount.text),
    status,
  ]);
}
