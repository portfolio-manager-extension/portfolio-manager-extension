import { ComponentChildren, h } from "preact";

type Props = {
  className?: string;
  title: string;
  content: ComponentChildren;
};

export default function Block({ title, content, className, ...rest }: Props) {
  const classNames = "pme-block" + (typeof className !== "undefined" ? ` ${className}` : "");
  return h("div", { className: classNames, ...rest }, [h("div", { className: "title" }, title), content]);
}
