import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { pageEffect } from "../../fn/pageEffect";
import { getMainNavItems } from "../getMainNavItems";
import PageTemplate from "../../components/lib/PageTemplate";
import MainFunctionality from "../../components/lib/MainFunctionality";
import { getAllPositionsData, getEmptyAllPositionsData } from "./data/getAllPositionsData";
import AllPositionsTreemapChart from "./AllPositionsTreemapChart";
import AllPositionsTable from "./AllPositionsTable";
import CreatePortfolio from "../components/CreatePortfolio";
import ManagePortfolios from "../components/ManagePortfolios";
import CollectDataManual from "../../components/lib/CollectDataManual";
import Button from "react-bootstrap/Button";

type SortableColumn = "name" | "allocated" | "valuation" | "performance";

export default function AllPositionsPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [loading, setLoading] = useState(true);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [data, setData] = useState<App.Portfolio.AllPositionsData>(getEmptyAllPositionsData());
  const [includeBalance, setIncludeBalance] = useState(true);
  const [showPerformance, setShowPerformance] = useState(false);
  const [sortedBy, setSortedBy] = useState<SortableColumn>("allocated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    (async function () {
      await fetchData({ sortedBy, sortDirection, includeBalance });
    })();

    return () => {
      removeFn.call(undefined);
    };
  }, [loadCount]);

  async function fetchData(options: App.Portfolio.AllPositionsOptions) {
    setData(await getAllPositionsData(loaderData.account, options));
    setLoading(false);
  }

  function onTableSorted(column: SortableColumn, direction: SortDirection) {
    setSortedBy(column);
    setSortDirection(direction);
    setLoadCount(loadCount + 1);
  }

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, loaderData.portfolios, "all-positions")}
      mainNavLeftAction={<CreatePortfolio account={loaderData.account} />}
      mainNavRightAction={<ManagePortfolios account={loaderData.account} selected={false} />}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="portfolio"
    >
      <MainFunctionality loading={loading} hasData={true} noDataComponent={<CollectDataManual />}>
        <Row>
          <Col xs={12}>
            <AllPositionsTreemapChart
              items={data.items}
              censorSensitiveData={settings.censorSensitiveData}
              showCurrentValuation={showPerformance}
              balance={data.balance}
              includeBalance={includeBalance}
            />
          </Col>
          <Col xs={12} className="filters-container mt-3">
            <Button variant="outline-primary" className="mr-2" onClick={() => setShowPerformance(!showPerformance)}>
              {showPerformance ? "Show Performance" : "Show Allocation"}
            </Button>
            <Button variant="outline-primary" onClick={() => setIncludeBalance(!includeBalance)}>
              {includeBalance ? (
                <i className="fa-regular fa-square-check mr-2"></i>
              ) : (
                <i className="fa-regular fa-square mr-2"></i>
              )}
              Include Balance
            </Button>
          </Col>
          <Col xs={12} className="mt-3">
            <AllPositionsTable
              account={loaderData.account}
              data={data}
              sortedBy={sortedBy}
              sortDirection={sortDirection}
              onSorted={onTableSorted}
            />
          </Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
