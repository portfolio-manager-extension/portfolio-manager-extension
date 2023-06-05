import React, { useState } from "react";
import PerformanceValue from "../../components/lib/PerformanceValue";

type Props = {
  data: App.Activity.TradingMonth;
  index: number;
};

export default function TradingRow({ data, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  function renderItem(row: App.Activity.TradingItem, index: number) {
    const props: any = {};
    if (index != -1) {
      props.key = index;
      props.className = "expanded-row";
    }

    return (
      <tr {...props}>
        <td>{index + 1}</td>
        <td className="cell-time">{row.time}</td>
        <td>
          <span className="sensitive-data">{row.desc}</span>
        </td>
        <td>{row.fee.value != 0 && <span className="sensitive-data">{row.fee.text}</span>}</td>
        <td>{row.tax.value != 0 && <span className="sensitive-data">{row.tax.text}</span>}</td>
        <td>
          <span className="sensitive-data">
            {data.netChanged.value < 0 ? "-" : ""}
            {row.amount.text}
          </span>
        </td>
        <td>
          <PerformanceValue value={row.profit.netAbsolute.value} text={row.profit.netAbsolute.text} icon={false} />
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="grouped-row" onClick={() => setExpanded(!expanded)}>
        <td>{index + 1}</td>
        <td>{data.time}</td>
        <td>
          <span className="sensitive-data">{data.desc}</span>
        </td>
        <td>{data.fee.value != 0 && <span className="sensitive-data">{data.fee.text}</span>}</td>
        <td>{data.tax.value != 0 && <span className="sensitive-data">{data.tax.text}</span>}</td>
        <td>
          <span className="sensitive-data">
            {data.netChanged.value < 0 ? "-" : ""}
            {data.netChanged.text}
          </span>
        </td>
        <td>
          <PerformanceValue value={data.profit.value} text={data.profit.text} icon={false} />
        </td>
      </tr>
      {expanded && data.items.map((r, i) => renderItem(r, i))}
    </>
  );
}
