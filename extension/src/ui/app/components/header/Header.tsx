import React, { useEffect, useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Brand from "./Brand";
import LinkFactory from "../../../LinkFactory";
import { Link } from "react-router-dom";
import SubscribeButton from "./SubscribeButton";

type Props = {
  useFixedPageSize: boolean;
  version: string;
  account: Extension.Account;
  portfolios: CustomEntity.Portfolio[];
  selectedMenu: "activities" | "portfolio" | "analytics" | "your-data";
  showSubscribeButton?: boolean;
};

export default function Header({
  useFixedPageSize,
  version,
  account,
  portfolios,
  selectedMenu,
  showSubscribeButton,
}: Props) {
  let portfolioLink = LinkFactory.getDefaultPageForPortfolioMenu(account);
  let portfolioText = "Portfolio";
  if (portfolios.length > 0) {
    const defaultPortfolio = portfolios.find(function (portfolio) {
      return portfolio.isDefault;
    });
    if (defaultPortfolio) {
      portfolioLink = LinkFactory.getPortfolioLink(account, defaultPortfolio.id);
    }
    portfolioText = "Portfolios";
  }

  return (
    <Navbar collapseOnSelect expand="lg" fixed="top" as="header">
      <Container fluid={!useFixedPageSize}>
        <Brand version={version} locale={account.locale} />

        <Nav>
          {selectedMenu == "portfolio" ? (
            <Nav.Link className="text-success fw-bold" onClick={(e) => e.preventDefault()}>
              {portfolioText}
            </Nav.Link>
          ) : (
            <Link role="button" className="nav-link" to={portfolioLink}>
              {portfolioText}
            </Link>
          )}

          {selectedMenu == "activities" ? (
            <Nav.Link className="text-success fw-bold" onClick={(e) => e.preventDefault()}>
              Activities
            </Nav.Link>
          ) : (
            <Link role="button" className="nav-link" to={LinkFactory.getDefaultPageForActivitiesMenu(account)}>
              Activities
            </Link>
          )}

          {/*{selectedMenu == "analytics" ? (*/}
          {/*  <Nav.Link className="text-success fw-bold" onClick={(e) => e.preventDefault()}>*/}
          {/*    Analytics*/}
          {/*  </Nav.Link>*/}
          {/*) : (*/}
          {/*  <Nav.Link>Analytics</Nav.Link>*/}
          {/*)}*/}

          {selectedMenu == "your-data" ? (
            <Nav.Link className="text-success fw-bold" onClick={(e) => e.preventDefault()}>
              Your Data
            </Nav.Link>
          ) : (
            <Link role="button" className="nav-link" to={LinkFactory.getDefaultPageForYourDataMenu(account)}>
              Your Data
            </Link>
          )}

          <SubscribeButton account={account} show={showSubscribeButton} />
        </Nav>
      </Container>
    </Navbar>
  );
}
