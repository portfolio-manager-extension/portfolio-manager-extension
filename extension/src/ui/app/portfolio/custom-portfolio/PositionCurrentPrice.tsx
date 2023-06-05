import React from "react";
import { getCountString } from "../../fn/getCountString";
import PerformanceValue from "../../components/lib/PerformanceValue";

type Props = {
  data: Service.TradeHistoryData;
};

export default function PositionCurrentPrice({ data }: Props) {
  if (!data.currentPrice) {
    return <></>;
  }
  return (
    <div className="group-container current-price">
      <div className="group-title">Current price</div>
      <dl>
        <dt>Price</dt>
        <dd className="sensitive-data gray">{data.currentPrice.text}</dd>

        <dt>Updated at</dt>
        <dd className="sensitive-data gray">{data.currentPrice.updatedAt}</dd>
      </dl>
    </div>
  );
}
