import React from "react";
import { Link } from "react-router-dom";
import LinkFactory from "../../../LinkFactory";

type Props = {
  account: Extension.Account;
};

export default function ImportExplanation({ account }: Props) {
  return (
    <div className="explanation alert alert-info">
      When you click Import data some current data may be under overwritten risk. Please read the details explanation
      below:
      <br />
      <br />
      <ul>
        <li>
          <b>Raw messages</b>: there is no risk at all, you can reprocess all of them if you want.
        </li>
        <li>
          <b>Custom data</b>: imported data will overwrite current data, so please export before running import.
        </li>
        <li>
          <b>To-do list (in locked pages)</b>: imported data will overwrite current data, so please export before
          running import.
        </li>
      </ul>
      The safest way to overcome the risk is:
      <ol>
        <li>
          <Link className="text-decoration-none" to={LinkFactory.getExportPage(account)}>
            Export your current data
          </Link>
          .
        </li>
        <li>Import data with backup file that you wish.</li>
        <li>Check Custom data, To-do list, if something went wrong run import again using backup data in step (1).</li>
      </ol>
    </div>
  );
}
