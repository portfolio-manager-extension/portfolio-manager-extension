import React from "react";
import Echart, { EchartProps } from "../../components/lib/Echart";
import ChartUtilities from "../../fn/ChartUtilities";

type Props = {
  items: App.Activity.DividendByInstrument[];
  censorSensitiveData: boolean;
};

export default function DividendByInstrumentsChart({ items, censorSensitiveData }: Props) {
  const chartData: { value: number; name: string }[] = [];
  for (const item of items) {
    chartData.push({
      value: item.amount.value,
      name: item.instrument.shortName,
    });
  }

  const option: EchartProps["option"] = {
    tooltip: {
      formatter: ChartUtilities.makeTooltipFormatter(censorSensitiveData, items, (data) => {
        return `${data.instrument.shortName}: ${data.percent.text}<br />Amount: ${data.amount.text}`;
      }),
    },
    series: [{ data: chartData, type: "pie", label: { show: !censorSensitiveData } }],
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Echart option={option} style={{ minHeight: 400 }} />
    </div>
  );
}
