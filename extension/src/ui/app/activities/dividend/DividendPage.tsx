import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { pageEffect } from "../../fn/pageEffect";
import PageTemplate from "../../components/lib/PageTemplate";
import { getMainNavItems } from "../getMainNavItems";
import MainFunctionality from "../../components/lib/MainFunctionality";
import { getDividendData, getEmptyDividendData } from "./data/getDividendData";
import DividendByInstrumentsChart from "./DividendByInstrumentsChart";
import DividendTable from "./DividendTable";
import DividendAggregateChart from "./DividendAggregateChart";
import YearsFilter from "../../components/lib/YearsFilter";
import DividendGroupedType from "./DividendGroupedType";
import CollectDataManual from "../../components/lib/CollectDataManual";

export default function DividendPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [loading, setLoading] = useState(true);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [data, setData] = useState<App.Activity.DividendData>(getEmptyDividendData());
  const [filteredYears, setFilteredYears] = useState<number[] | undefined>(undefined);
  const [groupedType, setGroupedType] = useState<App.Activity.DividendGroupedType>("month");

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    (async function () {
      await fetchData({ groupedType: groupedType, filteredYears: filteredYears });
    })();

    return () => {
      removeFn.call(undefined);
    };
  }, [loadCount]);

  async function fetchData(options: App.Activity.DividendDataOptions) {
    setData(await getDividendData(loaderData.account, options));
    setLoading(false);
  }

  async function onFilteredYearsChanged(years: number[]) {
    await fetchData({ groupedType: groupedType, filteredYears: years });
    setFilteredYears(years);
  }

  async function onGroupedTypeChanged(groupedType: App.Activity.DividendGroupedType) {
    await fetchData({ groupedType: groupedType, filteredYears: filteredYears });
    setGroupedType(groupedType);
  }

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, "dividend")}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="activities"
    >
      <MainFunctionality loading={loading} hasData={data.items.length != 0} noDataComponent={<CollectDataManual />}>
        <Row>
          <Col md={7}>
            <DividendAggregateChart items={data.items} censorSensitiveData={settings.censorSensitiveData} />
          </Col>
          <Col md={5}>
            <DividendByInstrumentsChart items={data.instruments} censorSensitiveData={settings.censorSensitiveData} />
          </Col>
          <Col md={12} className="filters-container">
            <YearsFilter years={data.years} preselected={data.years} onChanged={onFilteredYearsChanged} />
            <DividendGroupedType preselected={"month"} onChanged={onGroupedTypeChanged} />
          </Col>
          <Col md={12} className="mt-3">
            <DividendTable data={data} />
          </Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
