import React from "react";
import PerformanceValue from "../../components/lib/PerformanceValue";
import { Link } from "react-router-dom";
import LinkFactory from "../../../LinkFactory";

type Props = {
  account: Extension.Account;
  item: App.Portfolio.AllPositionsItem;
};

export default function AllPositionsRow({ account, item }: Props) {
  let nameCell = <td>{item.instrument.shortName}</td>;
  if (item.portfolioIds.length > 0) {
    nameCell = (
      <td>
        <Link
          className="text-decoration-none"
          to={LinkFactory.getPortfolioLink(account, item.portfolioIds[0], item.instrument.id)}
        >
          {item.instrument.shortName}
        </Link>
      </td>
    );
  }
  return (
    <tr>
      {nameCell}
      <td>
        <span className="sensitive-data">{item.size}</span>
      </td>
      <td>
        <span className="sensitive-data">{item.averageBuyIn.text}</span>
      </td>
      <td>
        <span className="sensitive-data">{item.currentPrice && item.currentPrice.text}</span>
      </td>
      <td>
        <span className="sensitive-data">{item.amount.text}</span>
      </td>
      <td>
        <span className="sensitive-data">{item.currentValuation && item.currentValuation.text}</span>
      </td>
      <td>
        {item.currentPerformance && (
          <PerformanceValue
            value={item.currentPerformance.absolute.value}
            text={item.currentPerformance.absolute.text + " · " + item.currentPerformance.percentage.text}
            icon={false}
          />
        )}
      </td>
    </tr>
  );
}
