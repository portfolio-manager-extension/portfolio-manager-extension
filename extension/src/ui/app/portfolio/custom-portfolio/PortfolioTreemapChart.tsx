import React from "react";
import Echart, { EchartProps } from "../../components/lib/Echart";

type Props = {
  positions: App.Portfolio.PortfolioPositionItem[];
  censorSensitiveData: boolean;
  showCurrentValuation: boolean;
};

function buildCensoredTreemapData() {
  const count = 7 + (Math.floor(Math.random() * 1000000) % 10);
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      name: "instrument",
      value: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100) - 50],
      tooltip: {
        name: "Instrument",
        allocation: "",
        valuation: "",
        performance: "",
      },
    });
  }
  return result;
}

export default function PortfolioTreemapChart({ positions, censorSensitiveData, showCurrentValuation }: Props) {
  let input: any = [];
  if (censorSensitiveData) {
    input = buildCensoredTreemapData();
  } else {
    input = positions.map(function (item) {
      let performance = 0;
      if (item.valuation != null) {
        if (item.valuation.valuation.value > item.amount.value) {
          const percent = (item.valuation.valuation.value - item.amount.value) / item.amount.value;
          if (percent < 0.1) performance = 30;
          else if (percent < 0.2) performance = 50;
          else performance = 100;
        }
        if (item.valuation.valuation.value < item.amount.value) {
          const percent = (item.valuation.valuation.value - item.amount.value) / item.amount.value;
          if (percent < -0.2) performance = -100;
          else if (percent < -0.1) performance = -50;
          else performance = -30;
        }
      }
      return {
        name: item.instrument.shortName,
        value: [
          showCurrentValuation && item.valuation != null ? item.valuation.valuation.value : item.amount.value,
          performance,
        ],
        tooltip: item.treeMapTooltip,
      };
    });
  }
  const total = input.reduce(function (sum: any, i: any) {
    return sum + i.value[0];
  }, 0);
  const data = [
    {
      name: "Portfolio",
      value: total,
      children: input,
    },
  ];

  const chartSeries = showCurrentValuation
    ? {
        type: "treemap",
        width: "100%",
        height: "100%",
        roam: "none",
        nodeClick: false,
        breadcrumb: { show: false },
        visualMin: -100,
        visualMax: 100,
        visualDimension: 1,
        levels: [
          {
            itemStyle: {
              borderWidth: 2,
              borderColor: "#f6f7f9",
              gapWidth: 2,
            },
          },
          {
            color: ["#942e38", "#aaa", "#269f3c"],
            colorMappingBy: "value",
            itemStyle: {
              gapWidth: 2,
            },
          },
        ],
        data: data,
      }
    : {
        type: "treemap",
        width: "100%",
        height: "100%",
        roam: "none",
        nodeClick: false,
        breadcrumb: { show: false },
        levels: [
          {
            itemStyle: {
              borderWidth: 2,
              borderColor: "#f6f7f9",
              gapWidth: 2,
            },
          },
          {
            itemStyle: {
              borderWidth: 2,
              borderColor: "#f6f7f9",
              gapWidth: 2,
            },
          },
        ],
        data: data,
      };

  const option: EchartProps["option"] = {
    series: [chartSeries],
    tooltip: {
      formatter: function (info: any) {
        if (typeof info.data === "undefined" || typeof info.data.tooltip === "undefined") {
          return "";
        }
        return [
          "<div>",
          `<p><b>${info.data.tooltip.name}</b></p>`,
          `<div>${info.data.tooltip.allocation}</div>`,
          `<div>${info.data.tooltip.valuation}</div>`,
          `<div>${info.data.tooltip.performance}</div>`,
          "</div>",
        ].join("");
      },
    },
    color: ["#4194cb", "#6abce2", "#8dcfec"],
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Echart option={option} style={{ minHeight: 400 }} />
      {censorSensitiveData && (
        <div className="text-center mt-2">
          <i>Note: number of positions and values are randomized to censor position's size</i>
        </div>
      )}
    </div>
  );
}
