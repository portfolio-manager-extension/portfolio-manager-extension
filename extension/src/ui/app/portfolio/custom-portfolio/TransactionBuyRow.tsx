import React from "react";

type Props = {
  transaction: Service.Transaction;
  index: number;
};

export default function TransactionBuyRow({ transaction, index }: Props) {
  let status = <td className="cell-status"></td>;
  if (transaction.status == "sold") {
    status = (
      <td className="cell-status text-muted">
        <span className="sensitive-data">Sold all</span>
      </td>
    );
  } else {
    let valuation: any = "";
    if (transaction.valuation) {
      if (transaction.valuation.absolute.value > 0) {
        valuation = (
          <>
            <span className="sensitive-data">
              {" - "}
              valuation: {transaction.valuation.valuation.text}
            </span>
            <span className="performance-positive">
              <i className="fa-solid fa-up-long" style={{ marginLeft: "0.5rem" }}></i>
              {transaction.valuation.absolute.text}
              {" · "}
              <span className="performance-positive">{transaction.valuation.percentage.text}</span>
            </span>
          </>
        );
      } else {
        valuation = (
          <>
            <span className="sensitive-data">
              {" - "}
              valuation: {transaction.valuation.valuation.text}
            </span>
            <span className="performance-negative">
              <i className="fa-solid fa-down-long" style={{ marginLeft: "0.5rem" }}></i>
              {transaction.valuation.absolute.text}
              {" · "}
              {transaction.valuation.percentage.text}
            </span>
          </>
        );
      }
    }

    if (transaction.status == "partial") {
      status = (
        <td className="cell-status">
          <span className="sensitive-data">Partially sold, holding {transaction.remaining}</span> {valuation}
        </td>
      );
    } else if (transaction.status == "holding") {
      status = (
        <td className="cell-status">
          <span className="sensitive-data">Holding</span>
          {valuation}
        </td>
      );
    }
  }

  return (
    <tr key={index}>
      <td className="cell-index">{index + 1}</td>
      <td className="cell-time">
        <span className="sensitive-data">{transaction.time}</span>
      </td>
      <td className="cell-quantity">
        <span className="sensitive-data">Buy {transaction.quantity}</span>
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
