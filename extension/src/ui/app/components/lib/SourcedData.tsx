import React, { PropsWithChildren } from "react";
import SourcedSpan from "./SourcedSpan";

type Props = PropsWithChildren & {
  source: App.SourceOfData;
  icon?: string;
  sensitive?: boolean;
  iconPlacement?: "before" | "after";
  textStyle?: "muted" | "warning" | "primary" | "danger";
  tooltip?: React.ReactNode;
  inferredTooltip?: React.ReactNode;
  customTooltip?: React.ReactNode;
  tooltipPlacement?: "top" | "right" | "bottom" | "left";
  tooltipId?: string;
  onClick?: () => void;
  className?: string;
};

export default function SourcedData({ source, children, inferredTooltip, customTooltip, ...rest }: Props) {
  if (source == "inferred") {
    if (typeof rest.icon == "undefined") {
      rest.icon = "fa fa-warning";
    }
    if (typeof rest.iconPlacement == "undefined") {
      rest.iconPlacement = "after";
    }
    if (typeof rest.textStyle == "undefined") {
      rest.textStyle = "warning";
    }
    if (typeof rest.sensitive == "undefined") {
      rest.sensitive = true;
    }
    if (typeof inferredTooltip !== "undefined") {
      rest.tooltip = inferredTooltip;
    }

    return (
      <SourcedSpan type="inferred" {...rest}>
        {children}
      </SourcedSpan>
    );
  }
  if (source == "custom") {
    if (typeof rest.icon == "undefined") {
      rest.icon = "fa fa-info-circle";
    }
    if (typeof rest.iconPlacement == "undefined") {
      rest.iconPlacement = "after";
    }
    if (typeof rest.textStyle == "undefined") {
      rest.textStyle = "primary";
    }
    if (typeof rest.sensitive == "undefined") {
      rest.sensitive = true;
    }
    if (typeof customTooltip !== "undefined") {
      rest.tooltip = customTooltip;
    }

    return (
      <SourcedSpan type="custom" {...rest}>
        {children}
      </SourcedSpan>
    );
  }
  return <div>{children}</div>;
}
