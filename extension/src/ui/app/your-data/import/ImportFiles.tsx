import React from "react";

type Props = {
  files: Backup.FileImportState[];
};

export default function ImportFiles({ files }: Props) {
  return (
    <ul className="list-group">
      {files.map(function (item, index) {
        if (item.state == "wait") {
          return (
            <li key={index} className="list-group-item">
              <i className="fa fa-file" style={{ marginRight: "0.5rem", width: "20px" }}></i>
              {item.file}
            </li>
          );
        }
        if (item.state == "importing") {
          return (
            <li key={index} className="list-group-item">
              <i className="fa fa-spin fa-spinner" style={{ marginRight: "0.5rem" }}></i>
              {item.file}
            </li>
          );
        }
        return (
          <li key={index} className="list-group-item">
            <i className="fa fa-check text-success" style={{ marginRight: "0.5rem", width: "20px" }}></i>
            {item.file}
          </li>
        );
      })}
    </ul>
  );
}
