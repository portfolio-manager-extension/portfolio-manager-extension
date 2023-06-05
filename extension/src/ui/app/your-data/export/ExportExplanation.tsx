import React from "react";

export default function ExportExplanation() {
  return (
    <div className="explanation alert alert-info">
      We respect your ownership of your own data and allow you to export all of your data and store it wherever you
      choose.
      <br />
      <br />
      The exported data includes:
      <ul>
        <li>Raw messages</li>
        <li>Custom data</li>
        <li>To-do list (in locked pages)</li>
      </ul>
      Since "Processed data" can be generated from the "Raw messages", it will not be exported.
    </div>
  );
}
