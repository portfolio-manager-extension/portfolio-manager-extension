import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { pageEffect } from "../../fn/pageEffect";
import { getMainNavItems } from "../getMainNavItems";
import PageTemplate from "../../components/lib/PageTemplate";
import MainFunctionality from "../../components/lib/MainFunctionality";
import { getCashFlowData, getEmptyCashFlowData } from "./data/getCashFlowData";
import CashFlowTable from "./CashFlowTable";
import CashFlowMonthlyContributeChart from "./CashFlowContributionChart";
import CashFlowAssetAggregateChart from "./CashFlowAssetAggregateChart";
import YearsFilter from "../../components/lib/YearsFilter";
import CashFlowGroupedType from "./CashFlowGroupedType";
import CollectDataManual from "../../components/lib/CollectDataManual";

export default function CashFlowPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [loading, setLoading] = useState(true);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [data, setData] = useState<App.Activity.CashFlowData>(getEmptyCashFlowData());
  const [filteredYears, setFilteredYears] = useState<number[] | undefined>(undefined);
  const [groupedType, setGroupedType] = useState<App.Activity.CashFlowGroupedType>("month");

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    (async function () {
      await fetchData({ groupedType: groupedType, filteredYears: filteredYears });
    })();

    return () => {
      removeFn.call(undefined);
    };
  }, [loadCount]);

  async function fetchData(options: App.Activity.CashFlowDataOptions) {
    setData(await getCashFlowData(loaderData.account, options));
    setLoading(false);
  }

  async function onFilteredYearsChanged(years: number[]) {
    await fetchData({ groupedType: groupedType, filteredYears: years });
    setFilteredYears(years);
  }

  async function onGroupedTypeChanged(groupedType: App.Activity.CashFlowGroupedType) {
    await fetchData({ groupedType: groupedType, filteredYears: filteredYears });
    setGroupedType(groupedType);
  }

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, "cash-in-n-out")}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="activities"
    >
      <MainFunctionality loading={loading} hasData={data.items.length != 0} noDataComponent={<CollectDataManual />}>
        <Row>
          <Col md={6}>
            <CashFlowMonthlyContributeChart data={data} censorSensitiveData={settings.censorSensitiveData} />
          </Col>
          <Col md={6}>
            <CashFlowAssetAggregateChart items={data.items} censorSensitiveData={settings.censorSensitiveData} />
          </Col>
          <Col md={12} className="filters-container">
            <YearsFilter years={data.years} preselected={data.years} onChanged={onFilteredYearsChanged} />
            <CashFlowGroupedType preselected={"month"} onChanged={onGroupedTypeChanged} />
          </Col>
          <Col md={12} className="mt-3">
            <CashFlowTable data={data} groupedType={"month"} account={loaderData.account} onItemSelected={() => {}} />
          </Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
