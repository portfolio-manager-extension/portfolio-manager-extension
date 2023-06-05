import React from "react";
import Echart, { EchartProps } from "../../components/lib/Echart";

type Props = {
  total: App.FormattedMonetary;
  amount: App.FormattedMonetary;
  percentage: App.FormattedPercentage;
  censorSensitiveData: boolean;
};

export default function PositionAllocationChart({ total, amount, percentage, censorSensitiveData }: Props) {
  const chartData: { value: number; name: string }[] = [
    { value: amount.value, name: censorSensitiveData ? "censored" : "Portfolio Amount" },
    { value: total.value - amount.value, name: censorSensitiveData ? "censored" : "All Positions Amount" },
  ];

  const option: EchartProps["option"] = {
    title: {
      text: censorSensitiveData ? ":)" : percentage.text,
      left: "center",
      top: "center",
    },
    series: [
      {
        data: chartData,
        type: "pie",
        label: { show: false },
        radius: ["70%", "80%"],
      },
    ],
    color: censorSensitiveData ? ["#dee2e6"] : ["#4194cb", "#dee2e6"],
  };

  return <Echart option={option} style={{ width: 120, height: 120 }} />;
}
