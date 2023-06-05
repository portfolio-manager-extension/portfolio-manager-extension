import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { Link } from "react-router-dom";
import Brand from "./Brand";
import LinkFactory from "../../../LinkFactory";

type Props = {
  useFixedPageSize: boolean;
  version: string;
  locale: Locale;
  hasAccount: boolean;
};

export default function EmptyHeader({ useFixedPageSize, version, locale, hasAccount }: Props) {
  return (
    <Navbar collapseOnSelect expand="lg" fixed="top" as="header">
      <Container fluid={!useFixedPageSize}>
        <Brand version={version} locale={locale} />

        <Nav>
          {hasAccount && (
            <Link className="btn btn-primary main-button" role="button" to={LinkFactory.getLobbyPage()}>
              <i className="fa fa-chart-line dim"></i>
              Open Application
            </Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
