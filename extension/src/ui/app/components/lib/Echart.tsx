import React, { useRef, useEffect } from "react";
import { init, getInstanceByDom } from "echarts";
import type { CSSProperties } from "react";
import type { EChartOption, ECharts, SetOptionOpts } from "echarts";
import UIEventListener from "../../../UIEventListener";

export type EchartProps = {
  option: EChartOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
};

export default function Echart({ option, style, settings, loading, theme }: EchartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    }

    function resizeChart() {
      if (chart != null && !chart.isDisposed()) {
        chart.resize();
      }
    }
    window.addEventListener("resize", resizeChart);

    const removeFn = UIEventListener.onSettingsChangedListener((settings) => {
      setTimeout(resizeChart, 300);
    });

    return () => {
      chart?.dispose();
      window.removeEventListener("resize", resizeChart);
      removeFn.call(undefined);
    };
  }, [theme]);

  useEffect(() => {
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart.setOption(option, settings);
    }
  }, [option, settings, theme]);

  useEffect(() => {
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      loading === true ? chart.showLoading() : chart.hideLoading();
    }
  }, [loading, theme]);

  return <div ref={chartRef} style={{ width: "100%", height: "100px", ...style }} />;
}
