import React from "react";
import Table from "react-bootstrap/Table";
import { CashFlowRow } from "./CashFlowRow";

type Props = {
  data: App.Activity.CashFlowData;
  groupedType: App.Activity.CashFlowGroupedType;
  account: Extension.Account;
  onItemSelected: (item: App.Activity.CashFlowItem) => void;
};
export default function CashFlowTable({ account, data }: Props) {
  const items = data.items;
  return (
    <Table id="activity-cash-flow-table" className={"grouped-by-" + data.groupedType} bordered hover>
      <thead>
        <tr>
          <th className="column-index">#</th>
          <th className="column-time">Time</th>
          <th className="column-desc">Description</th>
          <th className="column-amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <CashFlowRow item={item} index={index} key={index} groupedType={data.groupedType} />
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th colSpan={3} className="cell-total-text">
            TOTAL
          </th>
          <th className="cell-total-amount">
            <span className="sensitive-data">{data.total.text}</span>
          </th>
        </tr>
      </tfoot>
    </Table>
  );
}
