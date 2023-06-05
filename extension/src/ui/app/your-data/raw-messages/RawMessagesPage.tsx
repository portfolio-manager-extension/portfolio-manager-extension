import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { pageEffect } from "../../fn/pageEffect";
import { getEmptyRawMessagesData, getRawMessagesData } from "./data/getRawMessagesData";
import { getMainNavItems } from "../getMainNavItems";
import PageTemplate from "../../components/lib/PageTemplate";
import RawMessagesTable from "./RawMessagesTable";
import RawMessageOffcanvas from "./RawMessageOffcanvas";
import RawMessagesExplanation from "./RawMessagesExplanation";
import RawMessagesNoData from "./RawMessagesNoData";
import MainFunctionality from "../../components/lib/MainFunctionality";
import RawMessagesTypeFilter from "./RawMessagesTypeFilter";
import RawMessagesStatusFilter from "./RawMessagesStatusFilter";
import { ProcessorManager } from "../../../../processor/ProcessorManager";
import StorageFactory from "../../../../storage/StorageFactory";

type OffcanvasState = {
  show: boolean;
  item?: App.YourData.RawMessageItem;
};

export default function RawMessagesPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [data, setData] = useState<App.YourData.RawMessagesData>(getEmptyRawMessagesData);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [offcanvas, setOffcanvas] = useState<OffcanvasState>({ show: false });
  const [filteredType, setFilteredType] = useState<string | undefined>(undefined);
  const [filteredStatus, setFilteredStatus] = useState<RawEntity.MessageStatus>("unprocessed");
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);
  const [processingCheckedItems, setProcessingCheckedItems] = useState(false);
  const [deletingDuplicate, setDeletingDuplicate] = useState(false);

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    (async function () {
      await fetchData({ filteredType: undefined, filteredStatus: "unprocessed" });
    })();

    return () => {
      removeFn.call(undefined);
    };
  }, [loadCount]);

  async function fetchData(options: App.YourData.RawMessagesDataOptions) {
    setData(await getRawMessagesData(loaderData.account, options));
    setLoading(false);
  }

  function onItemSelected(item: App.YourData.RawMessageItem) {
    setOffcanvas({ show: true, item });
  }

  function onCheckedItemsChanged(ids: string[]) {
    setCheckedItemIds(ids);
  }

  async function onTypeFilterChanged(type: string | undefined) {
    await fetchData({ filteredType: type, filteredStatus: filteredStatus });
    setFilteredType(type);
  }

  async function onStatusFilterChanged(status: RawEntity.MessageStatus) {
    await fetchData({ filteredType: filteredType, filteredStatus: status });
    setFilteredStatus(status);
  }

  async function reprocessCheckedItemsId() {
    setProcessingCheckedItems(true);
    const processorManager = new ProcessorManager(StorageFactory);
    for (const id of checkedItemIds) {
      await processorManager.reprocess(id, loaderData.account);
    }
    setProcessingCheckedItems(false);
    setLoadCount(loadCount + 1);
  }

  async function deleteDuplicate() {
    setDeletingDuplicate(true);
    setTimeout(async function () {
      const repository = StorageFactory.makeMessageRepository(loaderData.account);
      await repository.deleteAllDuplicate();
      setDeletingDuplicate(false);
      setLoadCount(loadCount + 1);
    }, 1000);
  }

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, "raw-messages")}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="your-data"
    >
      {!settings.hideAllExplanations && <RawMessagesExplanation />}
      <Row>
        <Col xs={12} className="filters-container">
          <RawMessagesTypeFilter types={data.types} filteredType={filteredType} onChanged={onTypeFilterChanged} />
          <RawMessagesStatusFilter
            statuses={data.statuses}
            filteredStatus={filteredStatus}
            onChanged={onStatusFilterChanged}
          />
          {data.duplicated > 0 &&
            (deletingDuplicate ? (
              <a className="btn btn-danger float-end" style={{ marginLeft: "1rem" }}>
                <i className="fa fa-spin fa-spinner"></i>
              </a>
            ) : (
              <a className="btn btn-danger float-end" style={{ marginLeft: "1rem" }} onClick={() => deleteDuplicate()}>
                Delete {data.duplicated} duplicate
              </a>
            ))}
          {checkedItemIds.length > 0 &&
            (processingCheckedItems ? (
              <a className="btn btn-primary float-end">
                <i className="fa fa-spin fa-spinner"></i>
              </a>
            ) : (
              <a className="btn btn-primary float-end" onClick={() => reprocessCheckedItemsId()}>
                Reprocess · {checkedItemIds.length}
              </a>
            ))}
        </Col>
        <Col xs={12} className="mt-3">
          <MainFunctionality
            loading={loading}
            hasData={data.items.length != 0}
            noDataComponent={<RawMessagesNoData account={loaderData.account} />}
          >
            <RawMessagesTable
              items={data.items}
              onItemSelected={onItemSelected}
              onCheckedItemsChanged={onCheckedItemsChanged}
            />
          </MainFunctionality>
        </Col>
      </Row>
      <RawMessageOffcanvas
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
