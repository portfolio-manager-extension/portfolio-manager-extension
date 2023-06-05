import Block from "./Block";
import { h } from "preact";

type Props = {
  data: Service.TradeHistoryData;
};

export default function CurrentPrice({ data }: Props) {
  if (!data.currentPrice) {
    return null;
  }

  return h(Block, {
    className: "pme-current-price",
    title: "Price used for calculation",
    content: h("dl", null, [
      h("dt", null, "Price"),
      h("dd", null, data.currentPrice.text),
      h("dt", null, "Updated at"),
      h("dd", null, data.currentPrice.updatedAt),
    ]),
  });
}
