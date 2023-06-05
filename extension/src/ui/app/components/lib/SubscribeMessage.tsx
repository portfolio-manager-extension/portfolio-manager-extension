import React from "react";
import { Link } from "react-router-dom";
import LinkFactory from "../../../LinkFactory";

type Props = {
  account: Extension.Account;
  showTrialMessage: boolean;
  useFixedPageSize: boolean;
};
function getStyle(age: number): "info" | "warning" | "danger" {
  if (age < 14) return "info";
  if (age < 21) return "warning";
  return "danger";
}

export default function SubscribeMessage({ account, useFixedPageSize, showTrialMessage }: Props) {
  if (account.subscribed) return <></>;

  if (account.age < 7) {
    if (showTrialMessage) {
      return (
        <div id="subscribe-message" className={"alert alert-secondary"}>
          <div className={useFixedPageSize ? "container" : "container-fluid"}>
            Thank you for trying our extension! Please note that this is a 7-day trial period. By using our service, you
            agree to comply with our{" "}
            <Link className="text-decoration-none" to={LinkFactory.make(account.locale, false).termsOfService}>
              terms of service
            </Link>
            . If you find the extension useful, please consider subscribing. Rest assured that all data is stored on
            your machine, and all functionalities will continue to work as expected.
          </div>
        </div>
      );
    }
    return <></>;
  }
  const style = getStyle(account.age);

  return (
    <div id="subscribe-message" className={"alert alert-" + style}>
      <div className={useFixedPageSize ? "container" : "container-fluid"}>
        We're glad to see that you've been using our extension for{" "}
        <span className={"badge bg-" + style}>{account.age} days!</span> If you're finding it helpful, please consider
        subscribing to help us maintain and improve the extension. Rest assured that all data is still stored on your
        machine, and all functionalities will continue to work as expected.
      </div>
    </div>
  );
}
