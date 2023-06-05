import React from "react";
import PositionTransactionsTable from "./PositionTransactionsTable";
import PositionPerformance from "./PositionPerformance";
import PositionCurrentPrice from "./PositionCurrentPrice";

type Props = {
  data: App.Portfolio.PortfolioPositionItem;
};

export default function PositionDetail({ data }: Props) {
  return (
    <div className="detail-info">
      <div className="flex-grow-1 d-flex">
        <div className="left-container flex-grow-1">
          <div className="group-container">
            <div className="group-title">transactions</div>
            <PositionTransactionsTable transactions={data.tradeHistory.transactions} />
          </div>
        </div>
        <div className="right-container">
          <PositionPerformance data={data.tradeHistory} />
          <PositionCurrentPrice data={data.tradeHistory} />
        </div>
      </div>
    </div>
  );
}
