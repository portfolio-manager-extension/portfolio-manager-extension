import React from "react";
import Navbar from "react-bootstrap/Navbar";
import LinkFactory from "../../../LinkFactory";
import { Link } from "react-router-dom";

type Props = {
  version: string;
  locale: Locale;
};

export default function Brand({ version, locale }: Props) {
  const links = LinkFactory.make(locale, false);
  return (
    <Navbar.Brand as="div">
      <a>Portfolio Manager Extension</a>

      <Link className="app-version text-decoration-none" to={links.changesLog}>
        {version}
      </Link>
    </Navbar.Brand>
  );
}
