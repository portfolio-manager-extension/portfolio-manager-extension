import { h } from "preact";
import Block from "./Block";
import { getCountString } from "../fn/getCountString";

type Props = {
  data: Service.TradeHistoryData;
};

export default function Performance({ data }: Props) {
  const hasDividend = data.performance.dividend.value != 0;
  const hasProfit = data.performance.profit.value != 0;
  const hasFee = data.performance.fee.value != 0;
  const hasTax = data.performance.tax.value != 0;
  const hasSomething = hasDividend || hasProfit || hasFee || hasTax;
  if (!hasSomething) {
    return null;
  }
  const content = h("dl", null, [
    hasDividend &&
      h("dt", null, [
        "Dividend ",
        getCountString(data.performance.dividendCount, "", " ([count] time)", " ([count] times)"),
      ]),
    hasDividend && h("dd", null, data.performance.dividend.text),

    hasProfit && h("dt", null, "Gross profit"),
    hasProfit && h("dd", null, (data.performance.profit.value < 0 ? "-" : "") + data.performance.profit.text),

    hasFee && h("dt", null, "Fee"),
    hasFee && h("dd", null, (data.performance.fee.value < 0 ? "-" : "") + data.performance.fee.text),

    hasTax && h("dt", null, "Tax"),
    hasTax && h("dd", null, (data.performance.tax.value < 0 ? "-" : "") + data.performance.tax.text),

    h("dt", { className: "total" }, "Total"),
    h(
      "dd",
      { className: "total" },
      h(
        "span",
        { className: "performance " + (data.performance.total.value < 0 ? "-negative" : "-positive") },
        data.performance.total.text
      )
    ),
  ]);

  return h(Block, {
    className: "pme-performance",
    title: "Performance",
    content: content,
  });
}
