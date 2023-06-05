import React from "react";
import Echart, { EchartProps } from "../../components/lib/Echart";
import ChartUtilities from "../../fn/ChartUtilities";

type Props = {
  items: App.Activity.TradingMonth[];
  censorSensitiveData: boolean;
};

export default function TradingInvestedAggregateChart({ items, censorSensitiveData }: Props) {
  const labels: string[] = [];
  const aggregates: number[] = [];
  for (const item of items) {
    aggregates.push(Math.abs(item.investedAggregate.value));
    labels.push(item.time);
  }

  const option: EchartProps["option"] = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: ChartUtilities.makeTooltipFormatter(censorSensitiveData, items, (data) => {
        return `Time: ${data.time}<br />Aggregate: ${data.investedAggregate.text}`;
      }),
    },
    xAxis: {
      data: labels,
      show: !censorSensitiveData,
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      show: !censorSensitiveData,
    },
    series: [{ data: aggregates, type: "line", smooth: true, areaStyle: { color: "#198754", opacity: 0.2 } }],
    color: ["#198754"],
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Echart option={option} style={{ minHeight: 400 }} />
    </div>
  );
}
