import { h, ComponentChildren } from "preact";
import Logo from "./Logo";

type Props = {
  account: Extension.Account | undefined;
  version: string;
  isMinimized: boolean;
  onMinimizedToggle: () => void;
  children: ComponentChildren;
  // translations: TradeRepublic.Translations;
};

export default function Header({ account, version, isMinimized, onMinimizedToggle, children }: Props) {
  return h(
    "div",
    { className: "pme-header" },
    Logo({ account, version, isMinimized, onMinimizedToggle }),
    children && h("div", { className: "pme-header-content" }, children)
  );
}
