import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { pageEffect } from "../../fn/pageEffect";
import { getMainNavItems } from "../getMainNavItems";
import { getInterestData } from "./data/getInterestData";
import PageTemplate from "../../components/lib/PageTemplate";
import MainFunctionality from "../../components/lib/MainFunctionality";
import InterestTable from "./InterestTable";
import InterestChart from "./InterestChart";
import InterestOffcanvas from "./InterestOffcanvas";
import CollectDataManual from "../../components/lib/CollectDataManual";

type OffcanvasState = {
  show: boolean;
  item?: App.Activity.InterestItem;
};

export default function InterestPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [loading, setLoading] = useState(true);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [data, setData] = useState<App.Activity.InterestData>({
    items: [],
    years: [],
    total: { value: 0, currency: "", text: "" },
  });
  const [offcanvas, setOffcanvas] = useState<OffcanvasState>({ show: false });

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    (async function () {
      setData(await getInterestData(loaderData.account));
      setLoading(false);
    })();

    return () => {
      removeFn.call(undefined);
    };
  }, [loadCount]);

  function onItemSelected(item: App.Activity.InterestItem) {
    setOffcanvas({ show: true, item });
  }

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, "interest")}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="activities"
    >
      <MainFunctionality loading={loading} hasData={data.items.length != 0} noDataComponent={<CollectDataManual />}>
        <InterestChart items={data.items} censorSensitiveData={settings.censorSensitiveData} />
        <InterestTable data={data} account={loaderData.account} onItemSelected={onItemSelected} />
      </MainFunctionality>
      <InterestOffcanvas
        account={loaderData.account}
        show={offcanvas.show}
        closeHandler={() => setOffcanvas({ show: false })}
        reloadHandler={() => {
          setOffcanvas({ show: false });
          setLoadCount(loadCount + 1);
        }}
        item={offcanvas.item!}
      />
    </PageTemplate>
  );
}
