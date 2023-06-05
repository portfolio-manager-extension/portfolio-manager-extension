import React, { useEffect, useState } from "react";
import Formatter from "../../Formatter";
import StorageFactory from "../../../../storage/StorageFactory";

type Props = {
  account: Extension.Account;
};

export default function AccountOverview({ account }: Props) {
  const formatter = new Formatter(account.locale, account.defaultCurrency);
  const [dailyTaxInfo, setDailyTaxInfo] = useState<ProcessedEntity.DailyTaxInformation | undefined>(undefined);
  const [dailyCash, setDailyCash] = useState<ProcessedEntity.DailyCash | undefined>(undefined);

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  async function fetchData() {
    const cashRepository = StorageFactory.makeDailyCashRepository(account);
    setDailyCash(await cashRepository.findLatest());

    const taxInfoRepository = StorageFactory.makeDailyTaxInformationRepository(account);
    setDailyTaxInfo(await taxInfoRepository.findLatest());
  }

  if (typeof dailyCash === "undefined" && typeof dailyTaxInfo === "undefined") {
    return <></>;
  }

  let timestamp = 0;
  let taxInformation = null;
  if (typeof dailyTaxInfo !== "undefined") {
    const taxUsedPercentage =
      dailyTaxInfo.taxExemption.applied == 0
        ? 0
        : (dailyTaxInfo.taxExemption.used / dailyTaxInfo.taxExemption.applied) * 100;
    if (dailyTaxInfo.timestamp > timestamp) {
      timestamp = dailyTaxInfo.timestamp;
    }

    taxInformation = (
      <>
        <div className="flex-grow-1 d-flex justify-content-between tax-exemption">
          <div className="text-muted">Applied exemption order</div>
          <div className="sensitive-data gray">{formatter.currency(dailyTaxInfo.taxExemption.applied)}</div>
        </div>
        <div className="flex-grow-1 d-flex justify-content-between tax-exemption">
          <div className="text-muted">Used exemption order</div>
          <div className="sensitive-data gray">{formatter.currency(dailyTaxInfo.taxExemption.used)}</div>
        </div>
        <div className="flex-grow-1 d-flex justify-content-between mb-1 tax-exemption">
          <div className="fw-bold">Remaining exemption order</div>
          <div className="fw-bold sensitive-data gray">{formatter.currency(dailyTaxInfo.taxExemption.remaining)}</div>
        </div>

        <div className="tax-exemption-chart-container">
          <div className="sensitive-data hidden" style={{ width: taxUsedPercentage + "%" }}></div>
        </div>
      </>
    );
  }
  let cash = null;
  if (typeof dailyCash !== "undefined") {
    if (dailyCash.timestamp > timestamp) {
      timestamp = dailyCash.timestamp;
    }

    cash = (
      <div className="flex-grow-1 d-flex justify-content-between mb-3">
        <div className="fs-5 fw-bold">Balance</div>
        <div className="fs-5 fw-bold sensitive-data black">{formatter.currency(parseFloat(dailyCash.amount))}</div>
      </div>
    );
  }

  return (
    <div id="account-overview">
      {cash}
      {taxInformation}
      {timestamp && <div className="text-muted last-updated">Last updated at {formatter.datetime(timestamp)}</div>}
    </div>
  );
}
