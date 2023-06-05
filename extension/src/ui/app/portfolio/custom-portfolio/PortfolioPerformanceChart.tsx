import React from "react";
import Echart, { EchartProps } from "../../components/lib/Echart";
import ChartUtilities from "../../fn/ChartUtilities";

type Props = {
  account: Extension.Account;
  items: App.Portfolio.PortfolioPositionItem[];
  censorSensitiveData: boolean;
  mode: "percentage" | "absolute";
};

export default function PortfolioPerformanceChart({ account, items, censorSensitiveData, mode }: Props) {
  const values: Array<{ value: number; itemStyle: { color: string } }> = [];
  const labels = [];
  let unit = "";
  for (const item of items) {
    if (item.valuation) {
      if (mode == "percentage") {
        const color = item.valuation.percentage.value < 0 ? "rgba(229, 34, 12, 0.9)" : "rgba(0, 203, 57, 0.9)";
        values.push({ value: item.valuation.percentage.value * 100, itemStyle: { color: color } });
        unit = " %";
      } else {
        const color = item.valuation.absolute.value < 0 ? "rgba(229, 34, 12, 0.9)" : "rgba(0, 203, 57, 0.9)";
        values.push({ value: item.valuation.absolute.value, itemStyle: { color: color } });
        if (account.defaultCurrency == "EUR") {
          unit = " €";
        } else {
          unit = " " + account.defaultCurrency;
        }
      }
      labels.push(item.instrument.shortName);
    }
  }

  const option: EchartProps["option"] = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: ChartUtilities.makeTooltipFormatter(censorSensitiveData, items, (data) => {
        let performance = "";
        if (data.valuation) {
          if (mode == "percentage") {
            const sign = data.valuation.percentage.value < 0 ? "-" : "+";
            performance = `<div>Performance: ${sign}${data.valuation.percentage.text}</div>`;
          } else {
            const sign = data.valuation.absolute.value < 0 ? "-" : "+";
            performance = `<div>Performance: ${sign}${data.valuation.absolute.text}</div>`;
          }
        }
        return `<p><b>${data.instrument.shortName}</b></p>${performance}`;
      }),
    },
    xAxis: {
      data: labels,
      show: !censorSensitiveData,
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        rotate: 60,
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
