import React from "react";
import UIEventDispatcher from "../../../UIEventDispatcher";

type Props = {
  account: Extension.Account;
};
export default function RawMessagesNoData({ account }: Props) {
  return (
    <div className="alert alert-secondary">
      There is no raw messages data, please{" "}
      <a
        href=""
        className="text-warning text-decoration-none"
        onClick={() => UIEventDispatcher.openTradeRepublic(account)}
      >
        login into TradeRepublic app
      </a>{" "}
      on this browser, the extension will start to collect data.
      <br />
      <br />
      If you have any question or problem, please report in github.
    </div>
  );
}
