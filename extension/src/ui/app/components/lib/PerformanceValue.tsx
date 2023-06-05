import React from "react";

type Props = {
  value: number;
  text: string;
  negative?: boolean;
  className?: string;
  icon?: boolean;
  span?: boolean;
};
export default function PerformanceValue({ value, text, negative, icon, span, className }: Props) {
  const showIcon = typeof icon === "undefined" ? true : icon;
  let classNames = typeof className === "undefined" ? "" : className;
  const isNegative = typeof negative === "undefined" ? value < 0 : negative;
  const isUseSpan = typeof span === "undefined" ? false : span;

  if (isNegative) {
    classNames += " performance-negative";
    return isUseSpan ? (
      <span className={classNames.trim()}>
        {showIcon && <i className="fa-solid fa-down-long"></i>}
        {text}
      </span>
    ) : (
      <div className={classNames.trim()}>
        {showIcon && <i className="fa-solid fa-down-long"></i>}
        {text}
      </div>
    );
  }

  classNames += " performance-positive";
  return isUseSpan ? (
    <span className={classNames.trim()}>
      {showIcon && <i className="fa-solid fa-up-long"></i>}
      {text}
    </span>
  ) : (
    <div className={classNames.trim()}>
      {showIcon && <i className="fa-solid fa-up-long"></i>}
      {text}
    </div>
  );
}
