import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

type Props = {
  statuses: Map<RawEntity.MessageStatus, number>;
  filteredStatus: RawEntity.MessageStatus;
  onChanged: (status: RawEntity.MessageStatus) => void;
};

const STATUS_TEXTS = {
  processed: "Processed",
  "processed-with-warning": "Has Warning",
  unprocessed: "Unprocessed",
  duplicated: "Duplicated",
};

function getText(type: RawEntity.MessageStatus): string {
  // @ts-ignore
  return typeof STATUS_TEXTS[type] === "undefined" ? type : STATUS_TEXTS[type];
}

export default function RawMessagesTypeFilter({ statuses, filteredStatus, onChanged }: Props) {
  return (
    <Dropdown autoClose="outside" className="dropdown-filter hide-caret" style={{ marginLeft: "1rem" }}>
      <DropdownButton title={getText(filteredStatus)} variant="outline-primary">
        {Array.from(statuses).map(function (pairs, index) {
          return pairs[0] == filteredStatus ? (
            <Dropdown.Item key={index}>
              <div>
                <i className="fa fa-check"></i>
                <span className="text">{getText(pairs[0])}</span>
              </div>
            </Dropdown.Item>
          ) : (
            <Dropdown.Item key={index} onClick={() => onChanged(pairs[0])}>
              <div className="not-selected">
                <span className="text">{getText(pairs[0])}</span>
              </div>
            </Dropdown.Item>
          );
        })}
      </DropdownButton>
    </Dropdown>
  );
}
