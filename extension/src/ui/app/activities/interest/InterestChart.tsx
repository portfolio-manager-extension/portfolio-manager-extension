import React from "react";
import Echart, { EchartProps } from "../../components/lib/Echart";
import ChartUtilities from "../../fn/ChartUtilities";

type Props = {
  items: App.Activity.InterestItem[];
  censorSensitiveData: boolean;
};

export default function InterestChart({ items, censorSensitiveData }: Props) {
  const aggregates = [];
  const amounts = [];
  const labels = [];
  for (const item of items) {
    aggregates.push(item.previousAggregate.value);
    amounts.push(item.amount.value);
    labels.push(item.month);
  }

  const option: EchartProps["option"] = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: ChartUtilities.makeTooltipFormatter(censorSensitiveData, items, (data) => {
        return `Earn: ${data.amount.text}<br />Aggregate: ${data.aggregate.text}`;
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
    series: [
      { data: aggregates, type: "bar", stack: "x" },
      { data: amounts, type: "bar", stack: "x" },
    ],
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Echart option={option} style={{ minHeight: 400 }} />
    </div>
  );
}
