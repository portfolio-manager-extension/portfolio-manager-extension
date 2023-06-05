import { EMPTY_FORMATTED_MONETARY } from "../../const";

type Result = {
  transactions: Service.Transaction[];
  buy: number;
  sell: number;
  profit: number;
  fee: number;
  tax: number;
};

const TransactionsPerformance = {
  calculate(formatter: App.IFormatter, input: Service.Transaction[]): Result {
    const result: Result = {
      transactions: [],
      buy: 0,
      sell: 0,
      profit: 0,
      fee: 0,
      tax: 0,
    };

    for (let transaction of input) {
      result.fee += transaction.fee.value;
      result.tax += transaction.tax.value;

      if (transaction.type == "sell") {
        result.sell++;
        const sell = this.calculateRemainingAndProfit(formatter, result.transactions, transaction);
        result.profit += sell.profit.grossAbsolute.value;
        result.transactions.push(sell);
      } else {
        result.buy++;
        result.transactions.push(transaction);
      }
    }
    return result;
  },

  calculateRemainingAndProfit(
    formatter: App.IFormatter,
    transactions: Service.Transaction[],
    sell: Service.Transaction
  ): Service.Transaction {
    let quantity = sell.quantity;
    let boughtAmount = 0;
    for (let i = 0; i < transactions.length; i++) {
      if (quantity == 0) {
        break;
      }

      if (transactions[i].type == "sell" || transactions[i].status == "sold") {
        continue;
      }

      if (transactions[i].remaining <= quantity) {
        // if remaining <= quantity, it means everything in remaining will be sold out
        const remaining = transactions[i].remaining;
        transactions[i].remaining = 0;
        transactions[i].remainingAmount = EMPTY_FORMATTED_MONETARY;
        transactions[i].status = "sold";

        quantity -= remaining;
        boughtAmount += transactions[i].price.value * remaining;
        continue;
      }

      transactions[i].remaining = transactions[i].remaining - quantity;
      transactions[i].remainingAmount = formatter.monetary({
        // remaining amount (including fee) = amount - (sell quantity * price)
        // because with buy transaction amount is < 0, therefore we rewrite that to
        //     remaining-amount = abs(amount) - (sell * price)
        // but to keep it consistent with amount, we have to flip the sign
        //     remaining-amount = 0 - (abs(amount) - (sell * price))
        //  => remaining-amount = 0 - abs(amount) + (sell * price)
        // because -abs(amount) == amount, then
        //  => remaining = amount + (sell * price)
        value: transactions[i].amount.value + quantity * transactions[i].price.value,
        currency: transactions[i].price.currency,
      });
      transactions[i].status = "partial";
      boughtAmount += transactions[i].price.value * quantity;
      break;
    }

    const grossAbsolute = sell.price.value * sell.quantity - boughtAmount + sell.fee.value;
    const grossPercentage = boughtAmount != 0 ? grossAbsolute / boughtAmount : 0;

    const netAbsolute = sell.amount.value - boughtAmount;
    const netPercentage = boughtAmount != 0 ? netAbsolute / boughtAmount : 0;
    sell.profit.netAbsolute = formatter.monetary({
      value: netAbsolute,
      currency: sell.amount.currency,
    });
    sell.profit.grossAbsolute = formatter.monetary({
      value: grossAbsolute,
      currency: sell.amount.currency,
    });
    sell.profit.netPercentage = formatter.percentage({ value: netPercentage });
    sell.profit.grossPercentage = formatter.percentage({ value: grossPercentage });
    sell.status = "calculated";
    return sell;
  },
};
export default TransactionsPerformance;
