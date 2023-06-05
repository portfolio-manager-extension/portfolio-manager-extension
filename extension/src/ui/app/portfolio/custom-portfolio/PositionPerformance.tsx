import React from "react";
import { getCountString } from "../../fn/getCountString";
import PerformanceValue from "../../components/lib/PerformanceValue";

type Props = {
  data: Service.TradeHistoryData;
};

export default function PositionPerformance({ data }: Props) {
  const hasDividend = data.performance.dividend.value != 0;
  const hasProfit = data.performance.profit.value != 0;
  const hasFee = data.performance.fee.value != 0;
  const hasTax = data.performance.tax.value != 0;
  const hasSomething = hasDividend || hasProfit || hasFee || hasTax;
  if (!hasSomething) {
    return <></>;
  }
  return (
    <div className="group-container performance">
      <div className="group-title">performance</div>
      <dl>
        {hasDividend && (
          <dt>
            Dividend
            {getCountString(data.performance.dividendCount, "", " ([count] time)", " ([count] times)")}
          </dt>
        )}
        {hasDividend && <dd className="sensitive-data gray">{data.performance.dividend.text}</dd>}

        {hasProfit && <dt>Gross profit</dt>}
        {hasProfit && (
          <dd className="sensitive-data gray">
            {(data.performance.profit.value < 0 ? "-" : "") + data.performance.profit.text}
          </dd>
        )}

        {hasFee && <dt>Fee</dt>}
        {hasFee && (
          <dd className="sensitive-data gray">
            {(data.performance.fee.value < 0 ? "-" : "") + data.performance.fee.text}
          </dd>
        )}

        {hasTax && <dt>Tax</dt>}
        {hasTax && (
          <dd className="sensitive-data gray">
            {(data.performance.tax.value < 0 ? "-" : "") + data.performance.tax.text}
          </dd>
        )}

        <dt className="total">Total</dt>
        <dd className="total">
          <PerformanceValue
            value={data.performance.total.value}
            text={(data.performance.total.value < 0 ? "-" : "") + data.performance.total.text}
            icon={false}
          />
        </dd>
      </dl>
    </div>
  );
}
