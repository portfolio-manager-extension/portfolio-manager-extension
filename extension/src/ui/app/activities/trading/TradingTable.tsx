import React from "react";
import Table from "react-bootstrap/Table";
import TradingRow from "./TradingRow";
import PerformanceValue from "../../components/lib/PerformanceValue";

type Props = {
  data: App.Activity.TradingData;
};

export default function TradingTable({ data }: Props) {
  return (
    <Table id="activity-trading-table" className="grouped-by-month" bordered hover>
      <thead>
        <tr>
          <th className="column-index">#</th>
          <th className="column-time">Time</th>
          <th className="column-desc">Description</th>
          <th className="column-fee">Fee</th>
          <th className="column-tax">Tax</th>
          <th className="column-amount">Amount</th>
          <th className="column-profit">Profit</th>
        </tr>
      </thead>
      <tbody>
        {data.months.map(function (month, index) {
          return <TradingRow data={month} index={index} key={index} />;
        })}
      </tbody>
      <tfoot>
        <tr>
          <th colSpan={3} className="cell-total-text">
            TOTAL
          </th>
          <th className="cell-total cell-total-fee">
            <span className="sensitive-data">{data.fee.text}</span>
          </th>
          <th className="cell-total cell-total-tax">
            <span className="sensitive-data">{data.tax.text}</span>
          </th>
          <th className="cell-total cell-total-amount">
            <span className="sensitive-data">{data.amount.text}</span>
          </th>
          <th className="cell-total cell-total-profit">
            <PerformanceValue value={data.profit.value} text={data.profit.text} icon={false} />
          </th>
        </tr>
      </tfoot>
    </Table>
  );
}
