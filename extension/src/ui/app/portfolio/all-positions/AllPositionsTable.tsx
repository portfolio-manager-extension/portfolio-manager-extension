import React from "react";
import Table from "react-bootstrap/Table";
import AllPositionsRow from "./AllPositionsRow";
import PerformanceValue from "../../components/lib/PerformanceValue";
import ColumnSorting from "../../components/lib/ColumnSorting";

type SortableColumn = "name" | "allocated" | "valuation" | "performance";
type Props = {
  account: Extension.Account;
  data: App.Portfolio.AllPositionsData;
  sortedBy: SortableColumn;
  sortDirection: SortDirection;
  onSorted: (sortedBy: SortableColumn, direction: SortDirection) => void;
};

const TRADING_FEE = 1

export default function AllPositionsTable({ account, data, sortedBy, sortDirection, onSorted }: Props) {
  function triggerSortChanged(column: SortableColumn, direction: SortDirection | undefined) {
    if (typeof direction !== "undefined") {
      onSorted.call(undefined, column, direction);
      return;
    }
    onSorted.call(undefined, "name", "asc");
  }

  return (
    <Table id="all-positions-table" className={"grouped-by-none"} bordered hover>
      <thead>
        <tr>
          <th className="column-name">
            Name
            <ColumnSorting
              direction={sortedBy == "name" ? sortDirection : undefined}
              onChanged={(direction) => triggerSortChanged("name", direction)}
            />
          </th>
          <th className="column-quantity">Size</th>
          <th className="column-average-buy-in">Avg. buy in</th>
          <th className="column-price">Last Price</th>
          <th className="column-amount">
            Allocated
            <ColumnSorting
              direction={sortedBy == "allocated" ? sortDirection : undefined}
              onChanged={(direction) => triggerSortChanged("allocated", direction)}
            />
          </th>
          <th className="column-valuation">
            Last Valuation
            <ColumnSorting
              direction={sortedBy == "valuation" ? sortDirection : undefined}
              onChanged={(direction) => triggerSortChanged("valuation", direction)}
            />
          </th>
          <th className="column-performance">
            Performance
            <ColumnSorting
              direction={sortedBy == "performance" ? sortDirection : undefined}
              onChanged={(direction) => triggerSortChanged("performance", direction)}
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {data.items.map(function (item, index) {
          return <AllPositionsRow account={account} item={item} key={index} />;
        })}
      </tbody>
      <tfoot>
        <tr>
          <th colSpan={4} className="cell-total-text">
            TOTAL
          </th>
          <th className="cell-total-amount">
            <span className="sensitive-data">{data.allocated.text}</span>
          </th>
          <th className="cell-total-valuation">
            <span className="sensitive-data">{data.valuation.text}</span>
          </th>
          <th className="cell-total-performance">
            <PerformanceValue
              value={data.performance.absolute.value}
              text={(data.performance.absolute.value - 1) + " · " + data.performance.percentage.text}
              icon={false}
            />
          </th>
        </tr>
      </tfoot>
    </Table>
  );
}
