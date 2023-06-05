import { EMPTY_FORMATTED_MONETARY } from "../../const";
import { makeEmptyTradeHistoryData } from "./makeEmptyTradeHistoryData";
import TransactionsPerformance from "./TransactionsPerformance";
import TransactionValuation from "./TransactionValuation";

type Type = "sell" | "buy";
type Method = "standard" | "saving-plan";
const NUMBER_REGEX = /([0-9\.,]+)/;
function makeEmptyProfit() {
  return {
    netAbsolute: { value: 0, text: "", currency: "" },
    grossAbsolute: { value: 0, text: "", currency: "" },
    netPercentage: { value: 0, text: "" },
    grossPercentage: { value: 0, text: "" },
  };
}

const TradeHistoryDataFactory = {
  make(
    formatter: App.IFormatter,
    instrument: RawEntity.Instrument | undefined,
    holding: ProcessedEntity.Position | undefined,
    snapshot: RawEntity.TickerSnapshot | undefined,
    timelines: Service.TransactionTimelinePair[]
  ): Service.TradeHistoryData {
    if (timelines.length == 0) {
      return makeEmptyTradeHistoryData();
    }
    let hasWarning = false;
    let dividend = 0;
    let dividendCount = 0;
    let dividendTax = 0;

    const transactions: Service.Transaction[] = [];
    const splits = this.getSplits(instrument, timelines[0]![0].timestamp);
    for (const [timeline, detail] of timelines) {
      if (timeline.type == "dividend") {
        dividend += timeline.cashChangeAmount.value;
        dividendCount++;
        if (typeof detail !== "undefined") {
          dividendTax += (detail as ProcessedEntity.Dividend).tax.total.value;
        }
        continue;
      }

      const transaction = this.transformTransaction(formatter, timeline, detail);
      hasWarning = hasWarning || transaction.warning;
      if (splits.length > 0) {
        const lastSplit = splits[splits.length - 1];
        if (transaction.timestamp > lastSplit.date) {
          const split: RawEntity.InstrumentSplit = splits.pop()!;
          for (let i = 0, l = transactions.length; i < l; i++) {
            transactions[i].quantity = (transactions[i].quantity / split.initial) * split.final;
            transactions[i].remaining = (transactions[i].remaining / split.initial) * split.final;
            transactions[i].price = formatter.monetary({
              value: (transactions[i].price.value * split.initial) / split.final,
              currency: transactions[i].price.currency,
            });
          }
        }
      }
      transactions.push(transaction);
    }

    const result = TransactionsPerformance.calculate(formatter, transactions);
    let currentPrice = null;
    if (snapshot) {
      currentPrice = Object.assign(
        formatter.monetary({ value: parseFloat(snapshot.value), currency: formatter.defaultCurrency }),
        {
          updatedAt: formatter.datetime(snapshot.timestamp, true),
        }
      );
    }

    return {
      transactions:
        typeof snapshot !== "undefined"
          ? TransactionValuation.calculateValuation(formatter, snapshot, result.transactions)
          : result.transactions,
      count: { buy: result.buy, sell: result.sell },
      performance: {
        dividend: formatter.monetary({ value: dividend, currency: formatter.defaultCurrency }),
        dividendCount: dividendCount,
        tax: formatter.monetary({ value: result.tax + dividendTax, currency: formatter.defaultCurrency }),
        fee: formatter.monetary({ value: result.fee, currency: formatter.defaultCurrency }),
        profit: formatter.monetary({ value: result.profit, currency: formatter.defaultCurrency }),
        total: formatter.monetary({
          value: result.profit + dividend - Math.abs(result.fee) - Math.abs(result.tax),
          currency: formatter.defaultCurrency,
        }),
      },
      currentPrice: currentPrice,
    };
  },

  getSplits(instrument: RawEntity.Instrument | undefined, firstTimelineTimestamp: number): RawEntity.InstrumentSplit[] {
    return typeof instrument !== "undefined"
      ? instrument.splits
          .filter(function (split) {
            return split.date > firstTimelineTimestamp;
          })
          .sort(function (a, b) {
            if (a.date == b.date) {
              return 0;
            }
            return a.date < b.date ? 1 : -1;
          })
      : [];
  },

  generateTestCase(transactions: Service.Transaction[]) {
    const result = [];
    let date = Date.parse("2020-01-01 12:00:00");
    for (const transaction of transactions) {
      if (transaction.type == "sell") {
        const param = [
          date,
          transaction.quantity,
          transaction.price.value,
          transaction.fee.value,
          transaction.tax.value,
          transaction.amount.value,
        ];
        result.push("makeSellTransaction" + JSON.stringify(param).replace("[", "(").replace("]", ")"));
      } else {
        const param = [
          date,
          transaction.quantity,
          transaction.price.value,
          transaction.fee.value,
          transaction.amount.value,
        ];
        result.push("makeBuyTransaction" + JSON.stringify(param).replace("[", "(").replace("]", ")"));
      }
      date += 86400;
    }
  },

  transformTransaction(
    formatter: App.IFormatter,
    timeline: Service.TransactionTimelineInput,
    detail: Entity.ITimelineDetail | undefined
  ): Service.Transaction {
    const [type, method] = this.getTypeAndMethod(timeline);
    if (type == "buy") {
      if (typeof detail === "undefined") {
        return this.calculateBuyWithoutDetail(formatter, method, timeline);
      }
      return this.readBuyDetail(formatter, method, timeline, detail as ProcessedEntity.Buy);
    }

    if (typeof detail === "undefined") {
      return this.calculateSellWithoutDetail(formatter, method, timeline);
    }
    return this.readSellDetail(formatter, method, timeline, detail as ProcessedEntity.Sell);
  },

  getTypeAndMethod(timeline: Service.TransactionTimelineInput): [Type, Method] {
    let type: "buy" | "sell" = "buy";
    let method: "standard" | "saving-plan" = "standard";
    if (timeline.type == "sell") {
      type = "sell";
    }
    if (timeline.type == "saving-plan-execute" && timeline.cashChangeAmount.value > 0) {
      type = "sell";
      method = "saving-plan";
    }
    if (timeline.type == "saving-plan-execute" && timeline.cashChangeAmount.value < 0) {
      type = "buy";
      method = "saving-plan";
    }
    return [type, method];
  },

  readBuyDetail(
    formatter: App.IFormatter,
    method: Method,
    timeline: Service.TransactionTimelineInput,
    detail: ProcessedEntity.Buy
  ): Service.Transaction {
    return {
      timelineId: timeline.id,
      type: "buy",
      method: method,
      warning: false,
      quantity: detail.quantity,
      price: formatter.monetary(detail.price),
      fee: formatter.monetary(detail.fee),
      tax: EMPTY_FORMATTED_MONETARY,
      amount: formatter.monetary(timeline.cashChangeAmount),
      remaining: detail.quantity,
      remainingAmount: formatter.monetary(timeline.cashChangeAmount),
      profit: makeEmptyProfit(),
      status: "holding",
      timestamp: timeline.timestamp,
      time: formatter.datetime(timeline.timestamp),
      valuation: null,
    };
  },

  calculateBuyWithoutDetail(
    formatter: App.IFormatter,
    method: Method,
    timeline: Service.TransactionTimelineInput
  ): Service.Transaction {
    const price = this.parsePriceFromTimelineBody(timeline);
    const fee = method == "standard" ? -1 : 0;
    const quantity = price != 0 ? (Math.abs(timeline.cashChangeAmount.value) - Math.abs(fee)) / price : 0;
    return {
      timelineId: timeline.id,
      type: "buy",
      method: method,
      warning: true,
      quantity: quantity,
      price: formatter.monetary({ value: price, currency: formatter.defaultCurrency }),
      fee: formatter.monetary({ value: fee, currency: formatter.defaultCurrency }),
      tax: EMPTY_FORMATTED_MONETARY,
      amount: formatter.monetary(timeline.cashChangeAmount),
      remaining: quantity,
      remainingAmount: formatter.monetary(timeline.cashChangeAmount),
      profit: makeEmptyProfit(),
      status: "holding",
      timestamp: timeline.timestamp,
      time: formatter.datetime(timeline.timestamp),
      valuation: null,
    };
  },

  readSellDetail(
    formatter: App.IFormatter,
    method: Method,
    timeline: Service.TransactionTimelineInput,
    detail: ProcessedEntity.Sell
  ): Service.Transaction {
    return {
      timelineId: timeline.id,
      type: "sell",
      method: method,
      warning: false,
      quantity: detail.quantity,
      price: formatter.monetary(detail.price),
      fee: formatter.monetary(detail.fee),
      tax: formatter.monetary(detail.tax.total),
      amount: formatter.monetary(timeline.cashChangeAmount),
      remaining: 0,
      remainingAmount: EMPTY_FORMATTED_MONETARY,
      profit: makeEmptyProfit(),
      status: "unknown",
      timestamp: timeline.timestamp,
      time: formatter.datetime(timeline.timestamp),
      valuation: null,
    };
  },

  calculateSellWithoutDetail(
    formatter: App.IFormatter,
    method: Method,
    timeline: Service.TransactionTimelineInput
  ): Service.Transaction {
    const price = this.parsePriceFromTimelineBody(timeline);
    const fee = method == "standard" ? -1 : 0;
    const quantity = price != 0 ? (Math.abs(timeline.cashChangeAmount.value) - Math.abs(fee)) / price : 0;
    return {
      timelineId: timeline.id,
      type: "sell",
      method: method,
      warning: true,
      quantity: quantity,
      price: formatter.monetary({ value: price, currency: formatter.defaultCurrency }),
      fee: formatter.monetary({ value: fee, currency: formatter.defaultCurrency }),
      tax: EMPTY_FORMATTED_MONETARY,
      amount: formatter.monetary(timeline.cashChangeAmount),
      remaining: 0,
      remainingAmount: EMPTY_FORMATTED_MONETARY,
      profit: makeEmptyProfit(),
      status: "unknown",
      timestamp: timeline.timestamp,
      time: formatter.datetime(timeline.timestamp),
      valuation: null,
    };
  },

  parsePriceFromTimelineBody(timeline: Service.TransactionTimelineInput): number {
    let price = 0;
    if (NUMBER_REGEX.test(timeline.body)) {
      const matches = timeline.body.match(NUMBER_REGEX);
      if (matches && matches.length > 0) {
        price = parseFloat(matches[1].replace(",", ""));
      }
    }
    return price;
  },
};

export default TradeHistoryDataFactory;
