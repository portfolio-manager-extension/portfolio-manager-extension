import React, { useEffect, useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import PerformanceValue from "../../components/lib/PerformanceValue";
import PositionDetail from "./PositionDetail";
import { getCountString } from "../../fn/getCountString";

type Props = {
  selected: boolean;
  data: App.Portfolio.PortfolioPositionItem;
};

export default function PortfolioPositionItem({ selected, data }: Props) {
  const wrapper = useRef(null);
  const [showDetail, setShowDetail] = useState(selected);

  useEffect(() => {
    if (selected && wrapper.current != null) {
      // @ts-ignore
      wrapper.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  const iconURL = `https://assets.traderepublic.com/img/logos/${data.instrument.id}/light.svg`;
  let valuation = null;
  if (data.valuation) {
    valuation = (
      <div className="group-container valuation">
        <div className="group-title">valuation</div>
        <PerformanceValue
          value={data.valuation.valuation.value}
          text={data.valuation.valuation.text}
          className="amount"
          icon={false}
          negative={data.valuation.absolute.value < 0}
        />
        <div className="secondary-line">
          <PerformanceValue
            value={data.valuation.absolute.value}
            text={data.valuation.absolute.text}
            className="absolute"
            span
          />
          <PerformanceValue
            value={data.valuation.percentage.value}
            text={" · " + data.valuation.percentage.text}
            className="relative"
            span
            icon={false}
          />
        </div>
      </div>
    );
  }

  return (
    <Card
      ref={wrapper}
      id={"instrument-" + data.instrument.id}
      className={"portfolio-position" + (showDetail ? " opened" : "")}
    >
      <Card.Body>
        <div className="general-info flex-grow-1 d-flex" onClick={() => setShowDetail(!showDetail)}>
          <div className="icon">
            <img src={iconURL} />
          </div>
          <div className="group-container flex-grow-1">
            <div className="group-title">{data.instrument.id}</div>
            <div>{data.instrument.shortName}</div>
            <div className="secondary-line">
              <span className="sensitive-data gray">
                {[
                  getCountString(data.tradeHistory.count.buy, "", "[count] buy", "[count] buys"),
                  getCountString(data.tradeHistory.count.sell, "", "[count] sell", "[count] sells"),
                ]
                  .filter(function (i) {
                    return i != "";
                  })
                  .join(" · ")}
              </span>
            </div>
          </div>
          {data.amount.value != 0 && (
            <div className="group-container allocation">
              <div className="group-title">allocated</div>
              <div>
                <span className="sensitive-data gray">{data.amount.text}</span>
              </div>
              <div className="secondary-line sensitive-data gray">
                {data.size}
                <i className="fa-solid fa-multiply" style={{ margin: "0 0.5rem" }} />
                {data.averageBuyIn.text}
              </div>
            </div>
          )}
          {valuation}
          {/*<div className="group-container target">*/}
          {/*  <div className="group-title">target</div>*/}
          {/*</div>*/}
          <div className="expand-icon">
            {showDetail ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}
          </div>
        </div>
        {showDetail && <PositionDetail data={data} />}
      </Card.Body>
    </Card>
  );
}
