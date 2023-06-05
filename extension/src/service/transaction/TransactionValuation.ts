const TransactionValuation = {
  calculateValuation(
    formatter: App.IFormatter,
    snapshot: RawEntity.TickerSnapshot,
    transactions: Service.Transaction[]
  ): Service.Transaction[] {
    return transactions.map(function (transaction) {
      if (transaction.type == "sell") {
        return transaction;
      }
      if (transaction.status == "sold") {
        return transaction;
      }
      const value = parseFloat(snapshot.value);
      const amount = transaction.remaining * value;
      const remainingAmount = Math.abs(transaction.remainingAmount.value);
      const absolute = amount - remainingAmount;
      const percentage = remainingAmount == 0 ? 0 : absolute / remainingAmount;
      const valuation = {
        valuation: formatter.monetary({ value: amount, currency: formatter.defaultCurrency }),
        absolute: formatter.monetary({ value: absolute, currency: formatter.defaultCurrency }),
        percentage: formatter.percentage({ value: percentage }),
        updatedAt: formatter.datetime(snapshot.timestamp, true),
      };
      return Object.assign({}, transaction, { valuation });
    });
  },
};

export default TransactionValuation;
