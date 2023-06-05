import React from "react";
import DisplayedField from "../../components/form/DisplayedField";
import OffcanvasBlock from "../../components/lib/OffcanvasBlock";

type Props = {
  item: App.Activity.InterestItem;
};
export default function InterestProcessedData({ item }: Props) {
  return (
    <div className="align-right-form">
      <OffcanvasBlock text="Overview">
        <DisplayedField text="Asset" value="Cash" />
        <DisplayedField
          text="Avg Balance"
          value={item.averageBalance.source == "processed" ? item.averageBalance.text : "-"}
        />
        <DisplayedField text="Interest rate p.a." value={item.interest} />
        <DisplayedField text="Total" value={item.taxBase ? item.taxBase.text : "-"} total />
      </OffcanvasBlock>
      <OffcanvasBlock text="Settlement">
        <DisplayedField text="Tax base" value={item.taxBase ? item.taxBase.text : "-"} total />
        <DisplayedField text="Capital gains tax" />
        <DisplayedField text="Solidarity surcharge" />
        <DisplayedField text="Total" value={item.amount.text} total />
      </OffcanvasBlock>
    </div>
  );
}
