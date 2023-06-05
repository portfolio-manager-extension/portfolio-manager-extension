import React from "react";
import Echart, { EchartProps } from "../../components/lib/Echart";
import DataUtilities from "../../fn/DataUtilities";
import ChartUtilities from "../../fn/ChartUtilities";

type Props = {
  data: App.Activity.CashFlowData;
  censorSensitiveData: boolean;
};

export default function CashFlowMonthlyContributeChart({ data, censorSensitiveData }: Props) {
  const labels: string[] = [];
  const amounts: number[] = [];
  for (const item of data.items) {
    labels.push(item.time);
    amounts.push(item.amount.value);
  }
  const averages = Array(amounts.length).fill(data.average);
  const medians = Array(amounts.length).fill(data.median);

  const option: EchartProps["option"] = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: ChartUtilities.makeTooltipFormatter(censorSensitiveData, data.items, (item) => {
        return `Time: ${item.time}<br />Amount: ${item.amount.text}<br />Average: ${data.average.text}<br />Median: ${data.median.text}`;
      }),
    },
    legend: {
      type: "plain",
      data: ["Contribution", "Average", "Median"],
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
      { name: "Contribution", data: amounts, type: "bar" },
      { name: "Average", data: averages, type: "line", symbolSize: 0 },
      { name: "Median", data: medians, type: "line", symbolSize: 0 },
    ],
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Echart option={option} style={{ minHeight: 400 }} />
    </div>
  );
}
