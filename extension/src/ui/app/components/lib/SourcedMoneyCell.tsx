import React from "react";
import SourcedData from "./SourcedData";

type Props = {
  value: App.SourcedMonetary | undefined;
  icon?: string;
  sensitive?: boolean;
  iconPlacement?: "before" | "after";
  textStyle?: "muted" | "warning" | "danger";
  tooltip?: React.ReactNode;
  inferredTooltip?: React.ReactNode;
  customTooltip?: React.ReactNode;
  tooltipPlacement?: "top" | "right" | "bottom" | "left";
  tooltipId?: string;
  onClick?: () => void;
  hideIfZero?: boolean;
};

export function SourcedMoneyCell({
  value,
  icon,
  sensitive,
  iconPlacement,
  textStyle,
  tooltip,
  inferredTooltip,
  customTooltip,
  tooltipPlacement,
  tooltipId,
  hideIfZero,
  ...rest
}: Props & any) {
  if (typeof value === "undefined") {
    return (
      <td {...rest}>
        <span className="cell-no-data">No data</span>
      </td>
    );
  }
  if (hideIfZero && value.value == 0) {
    return (
      <td {...rest}>
        <span className="cell-no-data">-</span>
      </td>
    );
  }
  return (
    <td {...rest}>
      <SourcedData
        source={value.source}
        icon={icon}
        sensitive={sensitive}
        iconPlacement={iconPlacement}
        textStyle={textStyle}
        tooltip={tooltip}
        inferredTooltip={inferredTooltip}
        customTooltip={customTooltip}
        tooltipPlacement={tooltipPlacement}
        tooltipId={tooltipId}
      >
        {value.text}
      </SourcedData>
    </td>
  );
}

export default SourcedMoneyCell;
