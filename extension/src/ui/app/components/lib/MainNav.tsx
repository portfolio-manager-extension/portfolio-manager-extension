import React from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";

export type MainNavItem = {
  url: string;
  text: string;
  active: boolean;
};

type Props = {
  items: MainNavItem[];
  leftAction?: React.ComponentElement<any, any>;
  rightAction?: React.ComponentElement<any, any>;
  useFixedPageSize: boolean;
};

export default function MainNav({ items, leftAction, rightAction, useFixedPageSize }: Props) {
  return (
    <div id="main-nav">
      <div className={useFixedPageSize ? "container" : "container-fluid"}>
        <div id="main-nav-tabs-container">
          <div id="main-nav-tabs">
            <ul className="nav nav-tabs">
              {items.map((item, index) => (
                <li key={index} className="nav-item" role="presentation">
                  {item.active ? (
                    <Link role="tab" className="nav-link active" to="" onClick={(e) => e.preventDefault()}>
                      {item.text}
                    </Link>
                  ) : (
                    <Link role="tab" className="nav-link" to={item.url}>
                      {item.text}
                    </Link>
                  )}
                </li>
              ))}
              {typeof leftAction !== "undefined" && <li className="nav-item nav-action">{leftAction}</li>}
            </ul>
          </div>
          <div id="main-nav-tabs-right-actions">{typeof rightAction !== "undefined" && rightAction}</div>
        </div>
      </div>
    </div>
  );
}
