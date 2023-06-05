import { h } from "preact";

type Props = {
  selected: "trade-history";
};

export default function MainNav({ selected }: Props) {
  return h(
    "div",
    { id: "pme-main-nav-container" },
    h(
      "div",
      { id: "pme-main-nav" },
      h("ul", {}, [
        h(
          "li",
          null,
          selected == "trade-history" ? h("a", { className: "active" }, "Trade History") : h("a", null, "Trade History")
        ),
      ])
    )
  );
}
