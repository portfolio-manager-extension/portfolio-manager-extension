import React, { PropsWithChildren } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { v4 as uuid } from "uuid";

type Props = PropsWithChildren & {
  icon?: string;
  sensitive?: boolean;
  iconPlacement?: "before" | "after";
  textStyle?: "muted" | "warning" | "primary" | "danger";
  tooltip?: React.ReactNode;
  tooltipPlacement?: "top" | "right" | "bottom" | "left";
  tooltipId?: string;
  onClick?: () => void;
  className?: string;
  type: App.SourceOfData;
};

function SourcedSpanWithIconAndTooltip(
  { children, icon, iconPlacement, tooltip, tooltipId, tooltipPlacement, onClick }: Props,
  className: string
) {
  const id = typeof tooltipId != "undefined" ? tooltipId : uuid();
  if (iconPlacement == "before") {
    return (
      <span className={className}>
        <OverlayTrigger placement={tooltipPlacement} overlay={<Tooltip id={id}>{tooltip}</Tooltip>}>
          <i className={"icon " + icon} onClick={onClick} />
        </OverlayTrigger>
        {children}
      </span>
    );
  }
  return (
    <span className={className}>
      {children}
      <OverlayTrigger placement={tooltipPlacement} overlay={<Tooltip id={id}>{tooltip}</Tooltip>}>
        <i className={"icon " + icon} onClick={onClick} />
      </OverlayTrigger>
    </span>
  );
}

function SourcedSpanWithIcon({ children, icon, iconPlacement, onClick }: Props, className: string) {
  if (iconPlacement == "before") {
    return (
      <span className={className}>
        <i className={"icon " + icon} onClick={onClick} />
        {children}
      </span>
    );
  }
  return (
    <span className={className}>
      {children}
      <i className={"icon " + icon} onClick={onClick} />
    </span>
  );
}

function SourcedSpanWithTooltip({ children, tooltip, tooltipPlacement, tooltipId, onClick }: Props, className: string) {
  const id = typeof tooltipId != "undefined" ? tooltipId : uuid();

  return (
    <OverlayTrigger placement={tooltipPlacement} overlay={<Tooltip id={id}>{tooltip}</Tooltip>}>
      <span className={className} onClick={onClick}>
        {children}
      </span>
    </OverlayTrigger>
  );
}

export default function SourcedSpan(props: Props) {
  const className = [props.type + "-data sourced-data"];
  if (typeof props.className != "undefined") {
    className.push(props.className);
  }
  if (typeof props.textStyle != "undefined") {
    className.push("text-" + props.textStyle);
  }
  if (props.sensitive) {
    className.push("sensitive-data");
  }

  if (typeof props.icon != "undefined") {
    if (typeof props.tooltip != "undefined") {
      return SourcedSpanWithIconAndTooltip(props, className.join(" "));
    }
    return SourcedSpanWithIcon(props, className.join(" "));
  }

  className.push("without-icon");
  if (typeof props.tooltip != "undefined") {
    return SourcedSpanWithTooltip(props, className.join(" "));
  }
  return (
    <span className={className.join(" ")} onClick={props.onClick}>
      {props.children}
    </span>
  );
}
