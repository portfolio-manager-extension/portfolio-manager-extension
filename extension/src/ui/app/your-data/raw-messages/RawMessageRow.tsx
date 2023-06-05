import React, { useState } from "react";
import Form from "react-bootstrap/Form";

type Props = {
  item: App.YourData.RawMessageItem;
  checked: boolean;
  onSelect: (item: App.YourData.RawMessageItem) => void;
  onCheckedChanged: (item: App.YourData.RawMessageItem) => void;
};

export default function RawMessageRow({ item, onSelect, checked, onCheckedChanged }: Props) {
  let status = <span className="badge bg-secondary">Processed</span>;
  if (item.status == "duplicated") {
    status = <span className="badge bg-info">Duplicated</span>;
  }
  if (item.status == "processed-with-warning") {
    status = <span className="badge bg-warning">Has warning</span>;
  }
  if (item.status == "unprocessed") {
    status = <span className="badge bg-danger">Unprocessed</span>;
  }

  return (
    <tr onClick={() => onSelect(item)}>
      <td
        className="cell-checkbox"
        onClick={(e) => {
          e.stopPropagation();
          onCheckedChanged(item);
        }}
      >
        <Form.Check type="checkbox" checked={checked} onChange={() => onCheckedChanged(item)} />
      </td>
      <td className="cell-time">{item.time}</td>
      <td className="cell-content">{item.content}</td>
      <td className="cell-locale">{item.locale}</td>
      <td className="cell-type">{item.type}</td>
      <td className="cell-status">{status}</td>
    </tr>
  );
}
