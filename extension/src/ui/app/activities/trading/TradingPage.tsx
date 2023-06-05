import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { pageEffect } from "../../fn/pageEffect";
import { getMainNavItems } from "../getMainNavItems";
import PageTemplate from "../../components/lib/PageTemplate";
import MainFunctionality from "../../components/lib/MainFunctionality";
import CollectDataManual from "../../components/lib/CollectDataManual";
import { getEmptyTradingData, getTradingData } from "./data/getTradingData";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import YearsFilter from "../../components/lib/YearsFilter";
import TradingTable from "./TradingTable";
import TradingProfitChart from "./TradingProfitChart";
import TradingInvestedAggregateChart from "./TradingInvestedAggregateChart";

export default function TradingPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [loading, setLoading] = useState(true);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [data, setData] = useState<App.Activity.TradingData>(getEmptyTradingData());
  const [filteredYears, setFilteredYears] = useState<number[] | undefined>(undefined);

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    (async function () {
      await fetchData({ filteredYears: filteredYears });
    })();

    return () => {
      removeFn.call(undefined);
    };
  }, [loadCount]);

  async function fetchData(options: App.Activity.TradingDataOptions) {
    setData(await getTradingData(loaderData.account, options));
    setLoading(false);
  }

  async function onFilteredYearsChanged(years: number[]) {
    await fetchData({ filteredYears: years });
    setFilteredYears(years);
  }

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, "trading")}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="activities"
    >
      <MainFunctionality loading={loading} hasData={data.months.length > 0} noDataComponent={<CollectDataManual />}>
        <Row>
          <Col md={6}>
            <TradingInvestedAggregateChart items={data.months} censorSensitiveData={settings.censorSensitiveData} />
          </Col>
          <Col md={6}>
            <TradingProfitChart
              account={loaderData.account}
              items={data.months}
              censorSensitiveData={settings.censorSensitiveData}
            />
          </Col>
          <Col md={12} className="filters-container">
            <YearsFilter years={data.years} preselected={data.years} onChanged={onFilteredYearsChanged} />
          </Col>
          <Col md={12} className="mt-3">
            <TradingTable data={data} />
          </Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
