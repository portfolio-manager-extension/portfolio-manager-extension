import { EMPTY_FORMATTED_MONETARY } from "../../../const";
import TransactionsPerformance from "../TransactionsPerformance";
import { getDefaultFormatter } from "../../../ui/app/Formatter";

function makeEmptyProfit() {
  return {
    netAbsolute: { value: 0, text: "", currency: "" },
    grossAbsolute: { value: 0, text: "", currency: "" },
    netPercentage: { value: 0, text: "" },
    grossPercentage: { value: 0, text: "" },
  };
}

function makeBuyTransaction(
  date: number,
  quantity: number,
  price: number,
  fee: number,
  amount: number = quantity * price + fee
): Service.Transaction {
  return {
    timelineId: "",
    type: "buy",
    method: "standard",
    warning: false,
    quantity: quantity,
    price: { value: price, currency: "EUR", text: "" },
    fee: { value: fee, currency: "EUR", text: "" },
    tax: EMPTY_FORMATTED_MONETARY,
    amount: { value: amount, currency: "EUR", text: "" },
    remaining: quantity,
    remainingAmount: { value: amount, currency: "EUR", text: "" },
    profit: makeEmptyProfit(),
    status: "holding",
    timestamp: date,
    time: date.toString(),
    valuation: null,
  };
}

function makeSellTransaction(
  date: number,
  quantity: number,
  price: number,
  fee: number,
  tax: number,
  amount: number
): Service.Transaction {
  return {
    timelineId: "",
    type: "sell",
    method: "standard",
    warning: false,
    quantity: quantity,
    price: { value: price, currency: "EUR", text: "" },
    fee: { value: fee, currency: "EUR", text: "" },
    tax: { value: tax, currency: "EUR", text: "" },
    amount: { value: amount, currency: "EUR", text: "" },
    remaining: quantity,
    remainingAmount: { value: amount, currency: "EUR", text: "" },
    profit: makeEmptyProfit(),
    status: "holding",
    timestamp: date,
    time: date.toString(),
    valuation: null,
  };
}

function expectMoney(input: App.FormattedMonetary, expected: string) {
  expect(input.text).toEqual(expected + "\u00a0€");
}

describe("TransactionsPerformanceTest", function () {
  describe("Solved everything case", function () {
    function execute() {
      const input = [
        makeBuyTransaction(1577876400000, 6, 482.6, -1, -2896.6),
        makeSellTransaction(1577876486400, 3, 493, -1, -7.82, 1470.18),
        makeSellTransaction(1577876572800, 3, 493.35, -1, -8.1, 1470.95),
        makeBuyTransaction(1577876659200, 5, 319.35, -1, -1597.75),
        makeSellTransaction(1577876745600, 5, 404.25, -1, -111.44, 1908.81),
      ];
      return TransactionsPerformance.calculate(getDefaultFormatter(), input);
    }

    it("should calculate status correctly", function () {
      const result = execute();
      expect(result.transactions[0].status).toBe("sold");
      expect(result.transactions[1].status).toBe("calculated");
      expect(result.transactions[2].status).toBe("calculated");
      expect(result.transactions[3].status).toBe("sold");
      expect(result.transactions[4].status).toBe("calculated");
    });

    it("should calculate remaining correctly", function () {
      const result = execute();
      expect(result.transactions[0].remaining).toBe(0);
      expect(result.transactions[3].remaining).toBe(0);
    });

    it("should calculate profit correctly", function () {
      const result = execute();
      expectMoney(result.transactions[1].profit.grossAbsolute, "30,20");
      expectMoney(result.transactions[1].profit.netAbsolute, "22,38");
      expectMoney(result.transactions[2].profit.grossAbsolute, "31,25");
      expectMoney(result.transactions[2].profit.netAbsolute, "23,15");
      expectMoney(result.transactions[4].profit.grossAbsolute, "423,50");
      expectMoney(result.transactions[4].profit.netAbsolute, "312,06");
    });
  });
});
