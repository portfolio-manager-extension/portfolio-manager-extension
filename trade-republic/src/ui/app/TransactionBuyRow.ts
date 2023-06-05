import { Fragment, h } from "preact";

type Props = {
  transaction: Service.Transaction;
  index: number;
};

function getArrowSvg(direction: "up" | "down") {
  const props: any = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "8",
    height: "9",
    fill: "currentColor",
    viewBox: "0 0 8 9",
  };
  if (direction == "down") {
    props.style = { transform: "rotate(180deg)" };
  }
  return h(
    "svg",
    props,
    h("path", {
      d: "M3.71.12.332 3.5a.41.41 0 0 0 0 .58l.58.58c.16.16.42.16.58 0L3.183 2.97v5.618c0 .226.184.41.41.41h.82a.41.41 0 0 0 .41-.41V2.974L6.612 4.76c.16.16.42.16.58 0l.58-.58a.41.41 0 0 0 0-.58L4.292.12a.41.41 0 0 0-.58 0Z",
    })
  );
}

export default function TransactionBuyRow({ transaction, index }: Props) {
  let status = h("td", { className: "cell-status" });
  if (transaction.status == "sold") {
    status = h("td", { className: "cell-status sold-all" }, "Sold all");
  } else {
    let valuation: any = "";
    if (transaction.valuation) {
      if (transaction.valuation.absolute.value > 0) {
        valuation = h(Fragment, null, [
          " - ",
          `valuation: ${transaction.valuation.valuation.text}`,
          h("span", { className: "performance -positive" }, [
            getArrowSvg("up"),
            transaction.valuation.absolute.text,
            " · ",
            transaction.valuation.percentage.text,
          ]),
        ]);
      } else {
        valuation = h(Fragment, null, [
          " - ",
          `valuation: ${transaction.valuation.valuation.text}`,
          h("span", { className: "performance -negative" }, [
            getArrowSvg("down"),
            transaction.valuation.absolute.text,
            " · ",
            transaction.valuation.percentage.text,
          ]),
        ]);
      }
    }

    if (transaction.status == "partial") {
      status = h("td", { className: "cell-status" }, [
        `Partially sold, holding ${transaction.remaining}`,
        " ",
        valuation,
      ]);
    } else if (transaction.status == "holding") {
      status = h("td", { className: "cell-status" }, "Holding", valuation);
    }
  }

  return h("tr", { key: index }, [
    h("td", { className: "cell-index" }, index + 1),
    h("td", { className: "cell-time" }, transaction.time),
    h("td", { className: "cell-desc" }, `Buy ${transaction.quantity}`),
    h("td", { className: "cell-price" }, transaction.price.text),
    h("td", { className: "cell-fee" }, transaction.fee.value == 0 ? "-" : transaction.fee.text),
    h("td", { className: "cell-amount" }, transaction.amount.text),
    status,
  ]);
}
