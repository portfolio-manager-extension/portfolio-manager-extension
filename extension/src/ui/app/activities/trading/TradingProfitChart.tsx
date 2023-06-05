import React from "react";
import Echart, { EchartProps } from "../../components/lib/Echart";
import ChartUtilities from "../../fn/ChartUtilities";

type Props = {
  account: Extension.Account;
  items: App.Activity.TradingMonth[];
  censorSensitiveData: boolean;
};

export default function TradingProfitChart({ account, items, censorSensitiveData }: Props) {
  const values: Array<{ value: number; itemStyle: { color: string } }> = [];
  const labels = [];
  let unit = "";
  for (const item of items) {
    const color = item.profit.value < 0 ? "rgba(229, 34, 12, 0.9)" : "rgba(0, 203, 57, 0.9)";
    values.push({ value: item.profit.value, itemStyle: { color: color } });
    if (account.defaultCurrency == "EUR") {
      unit = " €";
    } else {
      unit = " " + account.defaultCurrency;
    }
    labels.push(item.time);
  }

  const option: EchartProps["option"] = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: ChartUtilities.makeTooltipFormatter(censorSensitiveData, items, (data) => {
        const sign = data.profit.value < 0 ? "-" : "+";
        const performance = `<div>Profit: ${sign}${data.profit.text}</div>`;
        return `<p><b>${data.time}</b></p>${performance}`;
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
      axisLabel: { formatter: `{value}${unit}` },
    },
    series: [{ data: values, type: "bar", stack: "x" }],
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Echart option={option} style={{ minHeight: 400 }} />
    </div>
  );
}
