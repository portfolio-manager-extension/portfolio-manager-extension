import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { pageEffect } from "../../fn/pageEffect";
import PageTemplate from "../../components/lib/PageTemplate";
import MainFunctionality from "../../components/lib/MainFunctionality";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getEmptyProcessedData, getProcessedData } from "./data/getProcessedData";
import { getMainNavItems } from "../getMainNavItems";
import ProcessedDataNoData from "./ProcessedDataNoData";

export default function ProcessedDataPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<App.YourData.ProcessedData>(getEmptyProcessedData());

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    (async function () {
      await fetchData({ filteredType: "timeline", filteredMonth: undefined });
    })();

    return () => {
      removeFn.call(undefined);
    };
  }, []);

  async function fetchData(options: App.YourData.ProcessedDataOptions) {
    setData(await getProcessedData(loaderData.account, options));
    setLoading(false);
  }

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, "processed-data")}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="your-data"
    >
      <MainFunctionality
        loading={loading}
        hasData={data.items.length != 0}
        noDataComponent={<ProcessedDataNoData account={loaderData.account} />}
      >
        <Row>
          <Col md={12} className="filters-container"></Col>
          <Col md={12} className="mt-3"></Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
