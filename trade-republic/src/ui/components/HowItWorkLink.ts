import { h } from "preact";
import { MessageSender } from "../../MessageSender";
import { BackgroundCommunicator } from "../../BackgroundCommunicator";

type Props = {
  text: string;
  locale: Locale;
  icon: boolean;
};

export default function HowItWorkLink({ locale, text, icon }: Props) {
  if (!icon) {
    return h("a", { className: "pme-how-it-works" }, text);
  }

  const svg = h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "12",
      height: "12",
      fill: "currentColor",
      viewBox: "0 0 12 12",
    },
    h("path", {
      d: "M9.5 2C9.8 2 10 2.2 10 2.5L10 8.5C10 8.8 9.8 9 9.5 9L8.5 9C8.2 9 8 8.8 8 8.5L8 5.4 3.5 9.9C3.3 10.1 3 10.1 2.8 9.9L2.1 9.2C1.9 9 1.9 8.7 2.1 8.5L6.6 4 3.5 4C3.2 4 3 3.8 3 3.5L3 2.5C3 2.2 3.2 2 3.5 2L9.5 2Z",
    })
  );
  return h(
    "a",
    {
      className: "pme-how-it-works",
      onClick: function () {
        const sender = new MessageSender();
        const communicator = new BackgroundCommunicator(sender);
        communicator.openLinkInNewTab(chrome.runtime.getURL(`app.html#/${locale}/how-it-works`));
      },
    },
    text,
    " ",
    svg
  );
}
