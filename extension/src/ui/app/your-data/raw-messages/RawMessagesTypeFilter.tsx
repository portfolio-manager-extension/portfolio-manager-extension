import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

type Props = {
  types: Map<string, number>;
  filteredType: string | undefined;
  onChanged: (type: string | undefined) => void;
};

const TYPE_TEXTS = {
  "timeline-events": "Timeline",
  "timeline-event-detail": "Timeline detail",
  "instrument-info": "Instrument info",
  positions: "Positions",
};

function getText(type: string): string {
  // @ts-ignore
  return typeof TYPE_TEXTS[type] === "undefined" ? type : TYPE_TEXTS[type];
}

export default function RawMessagesTypeFilter({ types, filteredType, onChanged }: Props) {
  const title = typeof filteredType === "undefined" ? "Show all types" : "Show: " + getText(filteredType);

  return (
    <Dropdown autoClose="outside" className="dropdown-filter hide-caret">
      <DropdownButton title={title} variant="outline-primary">
        {typeof filteredType == "undefined" ? (
          <Dropdown.Item>
            <div>
              <i className="fa fa-check"></i>
              <span className="text">All types</span>
            </div>
          </Dropdown.Item>
        ) : (
          <Dropdown.Item onClick={() => onChanged(undefined)}>
            <div className="not-selected">
              <span className="text">All types</span>
            </div>
          </Dropdown.Item>
        )}

        {Array.from(types).map(function (pairs, index) {
          return pairs[0] == filteredType ? (
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
