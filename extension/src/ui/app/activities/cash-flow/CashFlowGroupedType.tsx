import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

type Props = {
  preselected: App.Activity.CashFlowGroupedType;
  onChanged?: (groupedType: App.Activity.CashFlowGroupedType) => void;
};

export default function CashFlowGroupedType({ preselected, onChanged }: Props) {
  const [type, setType] = useState<App.Activity.CashFlowGroupedType>(preselected);

  function selectType(value: App.Activity.CashFlowGroupedType) {
    setType(value);
    if (typeof onChanged !== "undefined") {
      onChanged.call(undefined, value);
    }
  }

  return (
    <Dropdown autoClose="outside" id="activity-cash-flow-grouped-type" className="hide-caret">
      <DropdownButton title={<i className="fa fa-ellipsis"></i>} variant="outline-primary">
        {type == "month" ? (
          <Dropdown.Item>
            <i className="fa fa-check"></i>
            Grouped by month
          </Dropdown.Item>
        ) : (
          <Dropdown.Item onClick={() => selectType("month")}>
            <span className="not-selected">Grouped by month</span>
          </Dropdown.Item>
        )}
        {type == "none" ? (
          <Dropdown.Item>
            <i className="fa fa-check"></i>
            Show all, do not grouped
          </Dropdown.Item>
        ) : (
          <Dropdown.Item onClick={() => selectType("none")}>
            <span className="not-selected">Show all, do not grouped</span>
          </Dropdown.Item>
        )}
      </DropdownButton>
    </Dropdown>
  );
}
