import React from "react";

type Props = {
  direction: SortDirection | undefined;
  onChanged?: (direction: SortDirection | undefined) => void;
};

export default function ColumnSorting({ direction, onChanged }: Props) {
  function triggerOnChanged(direction: SortDirection | undefined) {
    if (typeof onChanged !== "undefined") {
      onChanged.call(undefined, direction);
    }
  }

  if (direction == "asc") {
    return <i className="fa fa-sort-down sorting" onClick={() => triggerOnChanged("desc")}></i>;
  }
  if (direction == "desc") {
    return <i className="fa fa-sort-up sorting" onClick={() => triggerOnChanged(undefined)}></i>;
  }
  return <i className="fa fa-sort sorting" onClick={() => triggerOnChanged("asc")}></i>;
}
