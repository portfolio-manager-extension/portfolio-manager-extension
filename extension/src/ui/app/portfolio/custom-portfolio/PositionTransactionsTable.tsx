import React, { useState } from "react";
import Table from "react-bootstrap/Table";
import TransactionBuyRow from "./TransactionBuyRow";
import TransactionSellRow from "./TransactionSellRow";

type Props = {
  transactions: Service.Transaction[];
};

type Item = {
  index: number;
  transaction: Service.Transaction | null;
};

function buildItems(transactions: Service.Transaction[], showHolding: boolean): Item[] {
  const groupedIndex = transactions.findIndex(function (item) {
    return item.type == "buy" && item.remaining > 0;
  });
  if (groupedIndex <= 0) {
    return transactions.map(function (transaction, index) {
      return {
        index: index,
        transaction: transaction,
      };
    });
  }

  const result: Item[] = [];
  let index = showHolding ? 0 : groupedIndex;
  transactions.forEach((transaction, i) => {
    if (i == groupedIndex) {
      result.push({ index: index, transaction: null });
      result.push({ index: index, transaction: transaction });
      index++;
      return;
    }

    if (showHolding || i > groupedIndex) {
      result.push({ index: index, transaction: transaction });
      index++;
    }
  });
  return result;
}

export default function PositionTransactionsTable({ transactions }: Props) {
  const [showHolding, setShowHolding] = useState(false);
  const items = buildItems(transactions, showHolding);
  const hiddenCount = Math.max(0, transactions.length - items.length) + 1;

  return (
    <Table className="transactions-table" size="sm" bordered hover>
      <thead>
        <tr>
          <th className="column-index"></th>
          <th className="column-time">Time</th>
          <th className="column-quantity"></th>
          <th className="column-price">Price</th>
          <th className="column-fee">Fee</th>
          <th className="column-amount">Amount</th>
          <th className="column-status">Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map(function (item, key) {
          if (item.transaction == null) {
            if (showHolding) {
              return (
                <tr className="action-row" key={key}>
                  <td colSpan={7}>
                    <a className="toggle-sold-transactions" onClick={() => setShowHolding(!showHolding)}>
                      Hide all transactions above which are not related to current holding.
                    </a>
                  </td>
                </tr>
              );
            }
            return (
              <tr className="action-row" key={key}>
                <td colSpan={7}>
                  There are {hiddenCount} transactions which are not related to current holding,{" "}
                  <a className="toggle-sold-transactions" onClick={() => setShowHolding(!showHolding)}>
                    show all of them.
                  </a>
                </td>
              </tr>
            );
          }

          if (item.transaction.type == "buy") {
            return <TransactionBuyRow transaction={item.transaction} index={item.index} key={key} />;
          }
          return <TransactionSellRow transaction={item.transaction} index={item.index} key={key} />;
        })}
      </tbody>
    </Table>
  );
}
