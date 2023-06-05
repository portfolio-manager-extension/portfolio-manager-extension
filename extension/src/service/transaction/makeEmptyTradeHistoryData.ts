export function makeEmptyTradeHistoryData(): Service.TradeHistoryData {
  return {
    transactions: [],
    count: { buy: 0, sell: 0 },
    performance: {
      dividend: { value: 0, text: "", currency: "" },
      dividendCount: 0,
      fee: { value: 0, text: "", currency: "" },
      profit: { value: 0, text: "", currency: "" },
      tax: { value: 0, text: "", currency: "" },
      total: { value: 0, text: "", currency: "" },
    },
    currentPrice: null,
  };
}
