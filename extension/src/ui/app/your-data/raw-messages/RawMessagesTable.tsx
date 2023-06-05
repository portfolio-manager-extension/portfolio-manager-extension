import React, { useEffect, useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import RawMessageRow from "./RawMessageRow";
import Form from "react-bootstrap/Form";

type Props = {
  items: App.YourData.RawMessageItem[];
  onItemSelected: (item: App.YourData.RawMessageItem) => void;
  onCheckedItemsChanged: (ids: string[]) => void;
};

export default function RawMessagesTable({ items, onItemSelected, onCheckedItemsChanged }: Props) {
  const checkAllRef = useRef(null);
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);

  useEffect(() => {
    setCheckedItemIds([]);
    onCheckedItemsChanged([]);
  }, [items]);

  function onItemCheckedChanged(item: App.YourData.RawMessageItem) {
    const set = new Set(checkedItemIds);
    if (set.has(item.id)) {
      set.delete(item.id);
    } else {
      set.add(item.id);
    }
    const values = Array.from(set);
    setCheckedItemIds(values);
    onCheckedItemsChanged(values);
  }

  function toggleCheckAllItem() {
    if (checkedItemIds.length < items.length) {
      const values = items.map((i) => i.id);
      setCheckedItemIds(values);
      onCheckedItemsChanged(values);
      return;
    }

    if (checkedItemIds.length == items.length) {
      setCheckedItemIds([]);
      onCheckedItemsChanged([]);
    }
  }

  if (checkAllRef.current != null) {
    // @ts-ignore
    checkAllRef.current.indeterminate = checkedItemIds.length > 0 && checkedItemIds.length < items.length;
  }

  const checkedSet = new Set(checkedItemIds);
  return (
    <Table id="raw-messages-table" bordered hover>
      <thead>
        <tr>
          <th className="column-checkbox">
            <Form.Check
              ref={checkAllRef}
              type="checkbox"
              checked={checkedItemIds.length == items.length}
              onChange={() => toggleCheckAllItem()}
            />
          </th>
          <th className="column-time">Time</th>
          <th className="column-content">
            Content <small className="text-muted fw-light">(trimmed)</small>
          </th>
          <th className="column-locale">Language</th>
          <th className="column-type">Type</th>
          <th className="column-status">Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map(function (item) {
          return (
            <RawMessageRow
              item={item}
              key={item.id}
              onSelect={onItemSelected}
              onCheckedChanged={onItemCheckedChanged}
              checked={checkedSet.has(item.id)}
            />
          );
        })}
      </tbody>
    </Table>
  );
}
