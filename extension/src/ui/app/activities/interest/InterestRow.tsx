import React from "react";
import SourcedMoneyCell from "../../components/lib/SourcedMoneyCell";

type Props = {
  item: App.Activity.InterestItem;
  index: number;
  onItemSelected: (item: App.Activity.InterestItem) => void;
};

export default function InterestRow({ item, index, onItemSelected }: Props) {
  return (
    <tr onClick={() => onItemSelected(item)}>
      <td className="cell-index">{index + 1}</td>
      <td className="cell-month">{item.time}</td>
      <td className="cell-desc">{item.desc}</td>
      <SourcedMoneyCell
        className="cell-avg-cash"
        inferredTooltip="This data is calculated based on amount and interest rate 2% p.a."
        customTooltip="This data is provided by you, it overrides processed data."
        value={item.averageBalance}
      />
      <SourcedMoneyCell className="cell-tax" value={item.tax} hideIfZero />
      <td className="cell-amount">
        <span className="sensitive-data">{item.amount.text}</span>
      </td>
    </tr>
  );
}
