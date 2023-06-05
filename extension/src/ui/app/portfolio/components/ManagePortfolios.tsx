import React from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import LinkFactory from "../../../LinkFactory";

type Props = {
  account: Extension.Account;
  selected: boolean;
};

export default function ManagePortfolios({ account, selected }: Props) {
  if (selected) {
    return (
      <Button active variant="outline-secondary" size="sm" style={{ borderColor: "transparent" }}>
        <i className="fa-solid fa-tools dim"></i>
        Manage portfolios
      </Button>
    );
  }

  return (
    <Link
      className="btn btn-outline-secondary btn-sm"
      role="button"
      style={{ borderColor: "transparent" }}
      to={LinkFactory.getManagePortfoliosLink(account)}
    >
      <i className="fa-solid fa-tools dim"></i>
      Manage portfolios
    </Link>
  );
}
