import React from "react";
import { Link } from "react-router-dom";
import LinkFactory from "../../../LinkFactory";

type Props = {
  account: Extension.Account;
  show?: boolean;
};

export default function SubscribeButton({ account, show }: Props) {
  const shouldShow = typeof show === "undefined" ? true : show;
  if (account.subscribed || !shouldShow) {
    return null;
  }

  return (
    <Link to={LinkFactory.getAccountPage(account)} className="btn btn-primary main-button">
      <i className="fa fa-cart-shopping dim"></i>
      Subscribe
    </Link>
  );
}
