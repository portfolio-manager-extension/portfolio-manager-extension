import React, { useState } from "react";

type Props = {
  value: string;
  startLength?: number;
  endLength?: number;
  separator?: string;
};
export default function ItemId({ value, startLength, endLength, separator }: Props) {
  const [full, setFull] = useState(false);
  if (full) {
    return (
      <code className="item-id" onClick={() => setFull(false)}>
        {value}
      </code>
    );
  }

  const start = typeof startLength === "undefined" || startLength <= 0 ? 6 : startLength;
  const end = typeof endLength === "undefined" || endLength <= 0 ? 4 : endLength;
  const sep = typeof separator === "undefined" ? "··" : separator;
  const text = value.substring(0, start) + sep + value.substring(value.length - end);
  return (
    <code className="item-id" onClick={() => setFull(true)}>
      {text}
    </code>
  );
}
