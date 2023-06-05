import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

type Props = {
  preselected: App.Activity.DividendGroupedType;
  onChanged?: (groupedType: App.Activity.DividendGroupedType) => void;
};

export default function DividendGroupedType({ preselected, onChanged }: Props) {
  const [type, setType] = useState<App.Activity.DividendGroupedType>(preselected);

  function selectType(value: App.Activity.DividendGroupedType) {
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
