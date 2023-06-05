import React from "react";

type Props = {
  transaction: Service.Transaction;
  index: number;
};

export default function TransactionSellRow({ transaction, index }: Props) {
  let status = null;
  if (transaction.profit.netAbsolute.value > 0) {
    status = (
      <td className="cell-status">
        <span className="performance-positive">
          Gain {transaction.profit.netAbsolute.text} · {transaction.profit.netPercentage.text}
        </span>
      </td>
    );
  } else {
    status = (
      <td className="cell-status">
        <span className="performance-negative">
          Loss {transaction.profit.netAbsolute.text} · {transaction.profit.netPercentage.text}
        </span>
      </td>
    );
  }

  return (
    <tr key={index}>
      <td className="cell-index">{index + 1}</td>
      <td className="cell-time">
        <span className="sensitive-data">{transaction.time}</span>
      </td>
      <td className="cell-quantity">
        <span className="sensitive-data">Sell {transaction.quantity}</span>
      </td>
      <td className="cell-price">
        <span className="sensitive-data">{transaction.price.text}</span>
      </td>
      <td className="cell-fee">
        <span className="sensitive-data">{transaction.fee.value == 0 ? "-" : transaction.fee.text}</span>
      </td>
      <td className="cell-amount">
        <span className="sensitive-data">{transaction.amount.text}</span>
      </td>
      {status}
    </tr>
  );
}
