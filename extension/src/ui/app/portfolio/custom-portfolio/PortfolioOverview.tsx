import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import PerformanceValue from "../../components/lib/PerformanceValue";
import PositionAllocationChart from "./PortfolioAllocationChart";
import { getCountString } from "../../fn/getCountString";

type Props = {
  data: App.Portfolio.PortfolioOverview;
  censorSensitiveData: boolean;
};

export default function PortfolioOverview({ data, censorSensitiveData }: Props) {
  return (
    <Row>
      <Col xs={12} sm={4}>
        <Card id="portfolio-allocation" className="shadow-sm">
          <Card.Body>
            <div className="flex-grow-1 d-flex justify-content-between">
              <dl className="mb-0">
                <dt className="fs-3 fw-bold sensitive-data black">{data.allocation.amount.text}</dt>
                <dd className="fs-sm fw-medium text-muted mb-0">
                  <div>Allocated</div>
                  <div style={{ fontSize: "0.8rem" }}>
                    <span className="sensitive-data gray">
                      {[
                        getCountString(data.allocation.count.position, "", "[count] position", "[count] positions"),
                        getCountString(data.allocation.count.buy, "", "[count] buy", "[count] buys"),
                        getCountString(data.allocation.count.sell, "", "[count] sell", "[count] sells"),
                      ]
                        .filter(function (i) {
                          return i != "";
                        })
                        .join(" · ")}
                    </span>
                  </div>
                </dd>
              </dl>
              <div className="chart-container">
                <PositionAllocationChart
                  total={data.allocation.holdingTotal}
                  amount={data.allocation.amount}
                  percentage={data.allocation.percentage}
                  censorSensitiveData={censorSensitiveData}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12} sm={4}>
        <Card id="portfolio-performance" className="shadow-sm">
          <Card.Body>
            <div className="flex-grow-1 d-flex justify-content-between">
              <dl className="mb-0">
                <dt className="fs-3 fw-bold text-success">
                  <PerformanceValue
                    value={data.valuation.valuation.value}
                    text={data.valuation.valuation.text}
                    icon={false}
                    negative={data.valuation.absolute.value < 0}
                  />
                </dt>
                <dd className="fs-sm fw-medium text-muted mb-0">Valuation</dd>
              </dl>
              <div className="changes">
                <PerformanceValue value={data.valuation.absolute.value} text={data.valuation.absolute.text} />
                <PerformanceValue
                  value={data.valuation.percentage.value}
                  text={"(" + data.valuation.percentage.text + ")"}
                  className="percentage"
                  icon={false}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12} sm={4}>
        <Card id="portfolio-performance" className="shadow-sm">
          <Card.Body>
            <div className="flex-grow-1 d-flex justify-content-between">
              <dl className="mb-0">
                <dt className="fs-3 fw-bold text-success">
                  <PerformanceValue
                    value={data.realized.total.value}
                    text={data.realized.total.text}
                    icon={false}
                    negative={data.realized.total.value < 0}
                  />
                </dt>
                <dd className="fs-sm fw-medium text-muted mb-0">
                  <div>
                    Realized
                    {data.realized.total.value >= 0 ? " Profit" : " Loss"}
                  </div>
                  {data.realized.dividendCount > 0 && (
                    <div style={{ fontSize: "0.8rem" }}>
                      {"including "}
                      <span className="sensitive-data gray">{data.realized.dividend.text}</span>
                      {" paid in dividend"}
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
