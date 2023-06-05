import React, { useState } from "react";

type Props = {
  item: App.Activity.CashFlowItem;
  groupedType: "none" | "month";
  index: number;
};

export function CashFlowRow({ item, index, groupedType }: Props) {
  const [expanded, setExpanded] = useState(false);

  function renderRow(row: App.Activity.CashFlowItem, index: number) {
    const props: any = {};
    if (index != -1 && groupedType == "month") {
      props.key = index;
      props.className = "expanded-row";
    }

    return (
      <tr {...props}>
        <td>{index + 1}</td>
        <td>{row.time}</td>
        <td>
          <span className="sensitive-data">{row.desc}</span>
        </td>
        <td>
          <span className="sensitive-data">{row.amount.text}</span>
        </td>
      </tr>
    );
  }

  if (item.items.length > 0) {
    return (
      <>
        <tr className="grouped-row" onClick={() => setExpanded(!expanded)}>
          <td>{index + 1}</td>
          <td>{item.time}</td>
          <td>{item.desc}</td>
          <td>
            <span className="sensitive-data">{item.amount.text}</span>
          </td>
        </tr>
        {expanded && item.items.map((r, i) => renderRow(r, i))}
      </>
    );
  }

  return groupedType == "none" ? renderRow(item, index) : renderRow(item, -1);
}
