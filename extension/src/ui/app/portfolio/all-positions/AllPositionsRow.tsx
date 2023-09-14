import React from "react";
import PerformanceValue from "../../components/lib/PerformanceValue";
import { Link } from "react-router-dom";
import LinkFactory from "../../../LinkFactory";
import { Decimal } from 'decimal.js';

type Props = {
  account: Extension.Account;
  item: App.Portfolio.AllPositionsItem;
};

type StopLossPriceProps = {
  item: App.Portfolio.AllPositionsItem;
}

export const StopLossPrice: React.FC<StopLossPriceProps> = ({ item }) => {
  const buyPrice = new Decimal(item.averageBuyIn.value)
  const stopLossPriceOne = buyPrice.mul(92).div(100)
  const stopLossPriceTwo = buyPrice.mul(90).div(100)
  const stopLossPriceThree = buyPrice.mul(88).div(100)
  return (
    <td>
      <span className="sensitive-data">1/3 in {stopLossPriceOne.toFixed(2)} € (-8%)</span>
      <br/>
      <span className="sensitive-data">1/3 in {stopLossPriceTwo.toFixed(2)} € (-10%)</span>
      <br/>
      <span className="sensitive-data">1/3 in {stopLossPriceThree.toFixed(2)} € (-12%)</span>
    </td>
  )
}

export default function AllPositionsRow({ account, item }: Props) {
  let nameCell = <td>{item.instrument.shortName}</td>;
  if (item.portfolioIds.length > 0) {
    nameCell = (
      <Link
        className="sensitive-data"
        to={LinkFactory.getPortfolioLink(account, item.portfolioIds[0], item.instrument.id)}
      >
        {item.instrument.shortName}
      </Link>
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
        <StopLossPrice item={item} />
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
