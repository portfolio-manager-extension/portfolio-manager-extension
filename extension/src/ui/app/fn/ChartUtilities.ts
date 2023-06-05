import Format = echarts.EChartOption.Tooltip.Format;

const ChartUtilities = {
  makeTooltipFormatter<T>(
    censor: boolean,
    data: T[],
    cb: (item: T) => string,
    offset: number = 0
  ): (params: Format | Format[]) => string {
    return function (params) {
      if (censor) {
        return "";
      }
      let index: number | undefined = -1;
      if (Array.isArray(params)) {
        index = params[0].dataIndex;
      } else {
        index = params.dataIndex;
      }
      if (typeof index == "undefined" || index + offset < 0 || index + offset > data.length) {
        return ``;
      }
      return cb.call(undefined, data[index + offset]);
    };
  },
};

export default ChartUtilities;
