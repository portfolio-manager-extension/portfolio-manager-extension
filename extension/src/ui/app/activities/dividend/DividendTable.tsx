import React from "react";
import Table from "react-bootstrap/Table";
import DividendRow from "./DividendRow";

type Props = {
  data: App.Activity.DividendData;
};

export default function DividendTable({ data }: Props) {
  return (
    <Table id="activity-dividend-table" className={"grouped-by-" + data.groupedType} bordered hover>
      <thead>
        <tr>
          <th className="column-index">#</th>
          <th className="column-time">Time</th>
          <th className="column-desc">Description</th>
          {/*<th className="column-quantity">Quantity</th>*/}
          {/*<th className="column-tax-n-fee">Tax & fee</th>*/}
          <th className="column-amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map(function (item, index) {
          return <DividendRow item={item} index={index} key={index} groupedType={data.groupedType} />;
        })}
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
