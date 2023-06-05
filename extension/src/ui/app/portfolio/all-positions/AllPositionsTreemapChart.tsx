import Echart, { EchartProps } from "../../components/lib/Echart";
import React, { useState } from "react";

type Props = {
  items: App.Portfolio.AllPositionsItem[];
  censorSensitiveData: boolean;
  showCurrentValuation: boolean;
  balance: App.Portfolio.AllPositionsBalance;
  includeBalance: boolean;
};

function buildTree(
  name: string,
  children: Array<{ name: string; value: [number, number] }>
): { name: string; value: any; children: any[] } {
  const total = children.reduce(function (sum, i) {
    return sum + i.value[0];
  }, 0);

  return {
    name: name,
    value: total,
    children: children,
  };
}

function buildTreemapDataGroupedByInstrumentType(
  items: App.Portfolio.AllPositionsItem[],
  showCurrentValue: boolean,
  balance: App.Portfolio.AllPositionsBalance,
  includeBalance: boolean
) {
  const groups: any = {
    stock: [],
    fund: [],
    crypto: [],
    derivative: [],
  };

  items.forEach(function (item, index) {
    let performance = 0;
    if (item.currentValuation != null) {
      if (item.currentValuation.value > item.amount.value) {
        const percent = (item.currentValuation.value - item.amount.value) / item.amount.value;
        if (percent < 0.1) performance = 30;
        else if (percent < 0.2) performance = 50;
        else performance = 100;
      }
      if (item.currentValuation.value < item.amount.value) {
        const percent = (item.currentValuation.value - item.amount.value) / item.amount.value;
        if (percent < -0.2) performance = -100;
        else if (percent < -0.1) performance = -50;
        else performance = -30;
      }
    }
    groups[item.instrument.type].push({
      name: item.instrument.shortName,
      value: [
        showCurrentValue && item.currentValuation != null ? item.currentValuation.value : item.amount.value,
        performance,
      ],
      isBalance: false,
      tooltip: item.tooltip,
    });
  });

  const data = [];
  if (groups.stock.length > 0) {
    data.push(buildTree("Stocks", groups.stock));
  }
  if (groups.fund.length > 0) {
    data.push(buildTree("ETFs", groups.fund));
  }
  if (groups.crypto.length > 0) {
    data.push(buildTree("Cryptos", groups.crypto));
  }
  if (groups.derivative.length > 0) {
    data.push(buildTree("Derivatives", groups.derivative));
  }
  if (includeBalance) {
    data.push({
      name: "Balance",
      value: balance.cash.value,
      children: [{ name: "Balance", value: [balance.cash.value, 0], isBalance: true, tooltip: balance.tooltip }],
    });
  }
  return data;
}

function buildCensoredTreemapData() {
  return [
    buildTree("Stocks", makeRandomData()),
    buildTree("ETFs", makeRandomData()),
    buildTree("Cryptos", makeRandomData()),
    buildTree("Derivatives", makeRandomData()),
  ];
}

function makeRandomData(): Array<{ name: string; value: [number, number] }> {
  const count = 7 + (Math.floor(Math.random() * 1000000) % 10);
  const result: Array<{ name: string; value: [number, number] }> = [];
  for (let i = 0; i < count; i++) {
    result.push({
      name: "instrument",
      value: [Math.floor(Math.random() * 100), 0],
    });
  }
  return result;
}

export default function AllPositionsTreemapChart({
  items,
  censorSensitiveData,
  showCurrentValuation,
  balance,
  includeBalance,
}: Props) {
  let data: any = [];
  if (censorSensitiveData) {
    data = buildCensoredTreemapData();
  } else {
    data = buildTreemapDataGroupedByInstrumentType(items, showCurrentValuation, balance, includeBalance);
  }

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
              gapWidth: 1,
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
        ],
        data: data,
      };

  const option: EchartProps["option"] = {
    series: [chartSeries],
    tooltip: {
      formatter: function (info: any) {
        if (typeof info.data === "undefined" || typeof info.data.isBalance === "undefined") {
          return "";
        }
        if (info.data.isBalance) {
          return [
            "<div>",
            `<p><b>${info.data.tooltip.name}</b></p>`,
            `<div>${info.data.tooltip.text}</div>`,
            `<div style="color: #aaa">${info.data.tooltip.desc}</div>`,
            "</div>",
          ].join("");
        }
        return [
          "<div>",
          `<p><b>${info.data.tooltip.name}</b></p>`,
          `<div>${info.data.tooltip.portfolio}</div>`,
          `<div>${info.data.tooltip.allocation}</div>`,
          `<div>${info.data.tooltip.valuation}</div>`,
          `<div>${info.data.tooltip.performance}</div>`,
          "</div>",
        ].join("");
      },
    },
    color: ["#234284", "#4194cb", "#6abce2", "#8dcfec", "#aaaaaa"],
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
