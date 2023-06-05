import { h } from "preact";
import { MessageSender } from "../../MessageSender";
import { BackgroundCommunicator } from "../../BackgroundCommunicator";

type Props = {
  account: Extension.Account | undefined;
  version: string;
  isMinimized: boolean;
  onMinimizedToggle: () => void;
};

export default function Logo({ account, version, isMinimized, onMinimizedToggle }: Props) {
  return h(
    "div",
    { className: "pme-logo" },
    h(
      "div",
      { className: "pme-brand" },
      h(
        "a",
        {
          title: "Click to open the extension",
          onClick: function () {
            const sender = new MessageSender();
            const communicator = new BackgroundCommunicator(sender);
            communicator.openApp(account);
          },
        },
        "Portfolio Manager Extension"
      )
    ),
    h(
      "div",
      { className: "pme-logo-second-line" },
      h(
        "div",
        { className: "pme-action-wrapper" },
        isMinimized
          ? h("a", { onClick: onMinimizedToggle }, "restore toolbar size")
          : h("a", { onClick: onMinimizedToggle }, "minimize toolbar")
      ),
      h("div", { className: "pme-version" }, version)
    )
  );
}
