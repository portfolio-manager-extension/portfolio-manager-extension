import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { pageEffect } from "../../fn/pageEffect";
import { getMainNavItems } from "../getMainNavItems";
import PageTemplate from "../../components/lib/PageTemplate";
import MainFunctionality from "../../components/lib/MainFunctionality";
import CreatePortfolio from "../components/CreatePortfolio";
import ManagePortfolios from "../components/ManagePortfolios";
import PortfolioNotFound from "./PortfolioNotFound";
import { getCustomPortfolioData, getEmptyCustomPortfolioData } from "./data/getCustomPortfolioData";
import QuickActions from "./QuickActions";
import StorageFactory from "../../../../storage/StorageFactory";
import LinkFactory from "../../../LinkFactory";
import PortfolioPositionList from "./PortfolioPositionList";
import PortfolioTreemapChart from "./PortfolioTreemapChart";
import PortfolioOverview from "./PortfolioOverview";
import ManageInstrumentsButton from "./manage-instruments/ManageInstrumentsButton";
import Button from "react-bootstrap/Button";
import PortfolioPerformanceChart from "./PortfolioPerformanceChart";

export default function CustomPortfolioPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [portfolios, setPortfolios] = useState<CustomEntity.Portfolio[]>(loaderData.portfolios);
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [loading, setLoading] = useState(true);
  const [showValuation, setShowValuation] = useState(true);
  const [showPerformanceAsPercentage, setShowPerformanceAsPercentage] = useState(true);
  const [data, setData] = useState<App.Portfolio.CustomPortfolioData>(getEmptyCustomPortfolioData());
  const [loadCount, setLoadCount] = useState<number>(0);

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    (async function () {
      await fetchData();
    })();

    return () => {
      removeFn.call(undefined);
    };
  }, [loadCount, loaderData]);

  async function fetchData() {
    if (!loaderData.currentPortfolio) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setData(
      await getCustomPortfolioData(loaderData.account, {
        portfolioId: loaderData.currentPortfolio.id,
      })
    );
    setLoading(false);
  }

  async function fetchPortfolios(redirect = false) {
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    const portfolios = (await repository.getAllActive()).sort(function (a, b) {
      if (a.order == b.order) {
        return a.name.localeCompare(b.name);
      }
      return a.order < b.order ? -1 : 1;
    });
    setPortfolios(portfolios);
    if (redirect) {
      if (portfolios.length > 0) {
        location.href = "#" + LinkFactory.getPortfolioLink(loaderData.account, portfolios[0].id);
      } else {
        location.href = "#" + LinkFactory.getPortfolioAllPositionsLink(loaderData.account);
      }
    }
  }

  async function onPortfoliosOrderSwapped(left: CustomEntity.Portfolio, right: CustomEntity.Portfolio) {
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    const tmp = left.order;
    left.order = right.order;
    right.order = tmp;
    await repository.saveBulk([left, right]);
    await fetchPortfolios();
  }

  async function onPortfolioSetAsDefault(
    currentDefault: CustomEntity.Portfolio | undefined,
    portfolio: CustomEntity.Portfolio
  ) {
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    if (typeof currentDefault === "undefined") {
      portfolio.isDefault = true;
      await repository.saveBulk([portfolio]);
      await fetchPortfolios();
      return;
    }
    currentDefault.isDefault = false;
    portfolio.isDefault = true;
    await repository.saveBulk([currentDefault, portfolio]);
    await fetchPortfolios();
  }

  async function onPortfolioDeleted(portfolio: CustomEntity.Portfolio) {
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    portfolio.status = "deleted";
    await repository.save(portfolio);
    await fetchPortfolios(true);
  }

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(
        loaderData.account,
        portfolios,
        typeof loaderData.currentPortfolio != "undefined" ? loaderData.currentPortfolio.id : ""
      )}
      mainNavLeftAction={
        <CreatePortfolio account={loaderData.account} onCreated={async () => await fetchPortfolios()} />
      }
      mainNavRightAction={<ManagePortfolios account={loaderData.account} selected={false} />}
      account={loaderData.account}
      settings={settings}
      portfolios={portfolios}
      selectedMenu="portfolio"
    >
      <MainFunctionality
        loading={loading}
        hasData={typeof loaderData.currentPortfolio !== "undefined"}
        noDataComponent={<PortfolioNotFound />}
      >
        <Row>
          {data.positions.length > 0 && (
            <Col xs={12} sm={6}>
              <PortfolioTreemapChart
                positions={data.positions}
                censorSensitiveData={settings.censorSensitiveData}
                showCurrentValuation={showValuation}
              />
            </Col>
          )}
          {data.positions.length > 0 && (
            <Col xs={12} sm={6}>
              <PortfolioPerformanceChart
                account={loaderData.account}
                items={data.positions}
                censorSensitiveData={settings.censorSensitiveData}
                mode={showPerformanceAsPercentage ? "percentage" : "absolute"}
              />
            </Col>
          )}
          <Col xs={12} className="filters-container mt-3">
            <Button variant="outline-primary" className="mr-2" onClick={() => setShowValuation(!showValuation)}>
              {showValuation ? "Show Valuation" : "Show Allocation"}
            </Button>
            <Button
              variant="outline-primary"
              className="mr-2"
              onClick={() => setShowPerformanceAsPercentage(!showPerformanceAsPercentage)}
            >
              {showPerformanceAsPercentage ? "Show Relative Performance" : "Show Absolute Performance"}
            </Button>
            <QuickActions
              portfolios={portfolios}
              currentPortfolio={loaderData.currentPortfolio!}
              onSwap={onPortfoliosOrderSwapped}
              onSetAsDefault={onPortfolioSetAsDefault}
              onDelete={onPortfolioDeleted}
            />
            <ManageInstrumentsButton
              account={loaderData.account}
              portfolioId={loaderData.currentPortfolio!.id}
              onPortfolioChanged={() => setLoadCount(loadCount + 1)}
            />
          </Col>
          <Col xs={12} className="mt-3">
            <PortfolioOverview data={data.overview} censorSensitiveData={settings.censorSensitiveData} />
          </Col>
          <Col xs={12} className="mt-3">
            <PortfolioPositionList positions={data.positions} selectedInstrumentId={loaderData.selectedInstrumentId} />
          </Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
