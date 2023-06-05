import React from "react";
import { Link } from "react-router-dom";
type Props = {
  links: UI.Link;
  showInternalDocumentLinks?: boolean;
};
export default function WhitePaperLinks({ showInternalDocumentLinks, links }: Props) {
  const showInternal = typeof showInternalDocumentLinks === "undefined" ? true : showInternalDocumentLinks;
  return (
    <ul className="list-group">
      {showInternal && (
        <li className="list-group-item list-group-item-action">
          <Link to={links.disclaimer} className="text-decoration-none">
            <i className="fa-solid fa-xmark"></i>
            Haftungsausschluss / Disclaimer
          </Link>
        </li>
      )}
      {showInternal && (
        <li className="list-group-item list-group-item-action">
          <Link to={links.howItWorks} className="text-decoration-none">
            <i className="fa-solid fa-book"></i>
            How it works
          </Link>
        </li>
      )}
      {showInternal && (
        <li className="list-group-item list-group-item-action">
          <Link to={links.termsOfService} className="text-decoration-none">
            <i className="fa-solid fa-file-alt"></i>
            Terms of service
          </Link>
        </li>
      )}
      {showInternal && (
        <li className="list-group-item list-group-item-action">
          <Link to={links.collectedData} className="text-decoration-none">
            <i className="fa-regular fa-file"></i>
            Collected data and reasons
          </Link>
        </li>
      )}
      <li className="list-group-item list-group-item-action">
        <a
          href="https://github.com/portfolio-manager-extension/portfolio-manager-extension/issues"
          className="text-decoration-none"
        >
          <i className="fa fa-bug"></i>
          Report Issue / Ask a Question
        </a>
      </li>
      <li className="list-group-item list-group-item-action">
        <a
          href="https://github.com/portfolio-manager-extension/portfolio-manager-extension"
          className="text-decoration-none"
        >
          <i className="fa-brands fa-github"></i>
          View source code
        </a>
      </li>
      <li className="list-group-item list-group-item-action">
        <a href="" className="text-decoration-none">
          <i className="fa-solid fa-mug-saucer"></i>
          Buy me a coffee
        </a>
      </li>
    </ul>
  );
}
