import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";

type Props = {
  years: Array<number>;
  preselected: Array<number>;
  onChanged?: (years: Array<number>) => void;
};

export default function YearsFilter({ years, preselected, onChanged }: Props) {
  const [selected, setSelected] = useState(new Set(preselected));

  function onSelect(year: number) {
    const clone = new Set(selected);
    if (clone.has(year) && clone.size > 1) {
      clone.delete(year);
      setSelected(clone);
      if (typeof onChanged != "undefined") {
        onChanged.call(undefined, Array.from(clone));
      }
      return;
    }

    clone.add(year);
    setSelected(clone);
    if (typeof onChanged != "undefined") {
      onChanged.call(undefined, Array.from(clone));
    }
  }

  function getText(): string {
    let selectAll = true;
    let shown = [];
    for (let i = 0; i < years.length; i++) {
      if (!selected.has(years[i])) {
        selectAll = false;
        continue;
      }
      shown.push(years[i]);
    }

    if (selectAll) {
      return "Show data in all years";
    }
    return "Show data in " + shown.join(", ");
  }

  return (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle variant="outline-primary">{getText()}</Dropdown.Toggle>

      <Dropdown.Menu>
        {years.map((year, index) => {
          return (
            <Dropdown.Item key={index} onClick={(i) => onSelect(year)}>
              <Form.Check type="checkbox" label={year} checked={selected.has(year)} readOnly />
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
