import React from "react";
import Table from "react-bootstrap/Table";
import InterestRow from "./InterestRow";

type Props = {
  data: App.Activity.InterestData;
  account: Extension.Account;
  onItemSelected: (item: App.Activity.InterestItem) => void;
};

export default function InterestTable({ account, data, onItemSelected }: Props) {
  const shownYears = new Set(data.years);
  const items = data.items.filter((item) => {
    const date = new Date(item.timestamp);
    return shownYears.has(date.getFullYear());
  });

  return (
    <Table id="activity-interest-table" bordered hover>
      <thead>
        <tr>
          <th className="column-index">#</th>
          <th className="column-month">Month</th>
          <th className="column-desc">Description</th>
          <th className="column-avg-cash">Average cash</th>
          <th className="column-tax">Tax</th>
          <th className="column-amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          return <InterestRow item={item} index={index} key={index} onItemSelected={onItemSelected} />;
        })}
      </tbody>
      <tfoot>
        <tr>
          <th colSpan={5} className="cell-total-text">
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
