import React, { useCallback, useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { pageEffect } from "../../fn/pageEffect";
import { getMainNavItems } from "../getMainNavItems";
import PageTemplate from "../../components/lib/PageTemplate";
import MainFunctionality from "../../components/lib/MainFunctionality";
import CreatePortfolio from "../components/CreatePortfolio";
import ManagePortfolios from "../components/ManagePortfolios";
import { getEmptyManagePortfoliosData, getManagePortfoliosData } from "./data/getManagePortfoliosData";
import { useDrop } from "react-dnd";
import update from "immutability-helper";
import PortfolioListItem from "./PortfolioListItem";
import StorageFactory from "../../../../storage/StorageFactory";
import PortfolioDetail from "./PortfolioDetail";

export default function ManagePortfoliosPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [loading, setLoading] = useState(true);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [data, setData] = useState<App.Portfolio.ManagePortfoliosData>(getEmptyManagePortfoliosData());
  const [showDeleted, setShowDeleted] = useState(false);
  const [activePortfolio, setActivePortfolio] = useState<App.Portfolio.ManagePortfoliosItem | null>(null);

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    (async function () {
      await fetchData(showDeleted, false);
    })();

    return () => {
      removeFn.call(undefined);
    };
  }, [loadCount]);

  async function fetchData(showDeleted: boolean, resetActivePortfolio: boolean) {
    const data = await getManagePortfoliosData(loaderData.account, { showDeleted: showDeleted });
    setData(data);
    setLoading(false);
    if (data.items.length > 0 && (resetActivePortfolio || activePortfolio == null)) {
      setActivePortfolio(data.items[0]);
    }
  }

  const findPortfolioItem = useCallback(
    (id: string) => {
      const item = data.items.filter((c) => `${c.id}` === id)[0] as App.Portfolio.ManagePortfoliosItem;
      return {
        item,
        index: data.items.indexOf(item),
      };
    },
    [data]
  );

  const movePortfolioItem = useCallback(
    (id: string, atIndex: number) => {
      const { item, index } = findPortfolioItem(id);
      setData({
        items: update(data.items, {
          $splice: [
            [index, 1],
            [atIndex, 0, item],
          ],
        }),
        active: data.active,
      });
    },
    [findPortfolioItem, data, setData]
  );

  async function onDnDEnd() {
    let order = 1;
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    for (const item of data.items) {
      await repository.updateOrder(item.id, order);
      order++;
    }
    setLoadCount(loadCount + 1);
  }

  function onListItemSelected(item: App.Portfolio.ManagePortfoliosItem) {
    setActivePortfolio(item);
  }

  async function onItemHardDelete(item: App.Portfolio.ManagePortfoliosItem) {
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    await repository.deleteById(item.id);
    setActivePortfolio(null);
    setLoadCount(loadCount + 1);
  }

  async function onItemDelete(item: App.Portfolio.ManagePortfoliosItem) {
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    const entity = await repository.findById(item.id);
    if (entity) {
      entity.status = "deleted";
      await repository.save(entity);
    }
    await fetchData(showDeleted, true);
  }

  async function onItemRestore(item: App.Portfolio.ManagePortfoliosItem) {
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    const entity = await repository.findById(item.id);
    if (entity) {
      entity.status = "active";
      entity.isDefault = false;
      await repository.save(entity);
    }
    setShowDeleted(false);
    setLoadCount(loadCount + 1);
  }

  async function onItemUpdate(item: App.Portfolio.ManagePortfoliosItem, data: { name: string }) {
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    const entity = await repository.findById(item.id);
    if (entity) {
      entity.name = data.name;
      await repository.save(entity);
      setActivePortfolio(Object.assign({}, activePortfolio, data));
    }
    await fetchData(showDeleted, false);
  }

  async function onItemMakeDefault(item: App.Portfolio.ManagePortfoliosItem) {
    const repository = StorageFactory.makePortfolioRepository(loaderData.account);
    const currentDefault = data.active.find(function (item) {
      return item.isDefault;
    });
    if (currentDefault) {
      currentDefault.isDefault = false;
      await repository.save(currentDefault);
    }
    const entity = await repository.findById(item.id);
    if (entity) {
      entity.isDefault = true;
      await repository.save(entity);
      setActivePortfolio(Object.assign({}, activePortfolio, { isDefault: true }));
    }
    await fetchData(showDeleted, false);
  }

  const [, drop] = useDrop(() => ({ accept: "portfolio-item" }));
  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, loading ? loaderData.portfolios : data.active, "")}
      mainNavLeftAction={<CreatePortfolio account={loaderData.account} />}
      mainNavRightAction={<ManagePortfolios account={loaderData.account} selected />}
      account={loaderData.account}
      settings={settings}
      portfolios={loading ? loaderData.portfolios : data.active}
      selectedMenu="portfolio"
    >
      <MainFunctionality loading={loading} hasData={true} noDataComponent={<div></div>}>
        <Row>
          <Col xs={12} className="mt-3">
            <Row>
              <Col xs={4}>
                <h5>{showDeleted ? "Deleted portfolios" : "Active portfolios"}</h5>
                <ul ref={drop} id="portfolio-list" className="list-group">
                  {data.items.map((item, i) => {
                    return (
                      <PortfolioListItem
                        key={item.id}
                        item={item}
                        index={i}
                        active={activePortfolio != null && activePortfolio.id == item.id}
                        movePortfolioItem={movePortfolioItem}
                        findPortfolioItem={findPortfolioItem}
                        onDnDEnd={onDnDEnd}
                        onSelected={onListItemSelected}
                      />
                    );
                  })}
                </ul>
                <div className="text-center mt-3">
                  {showDeleted ? (
                    <a
                      id="switch-portfolio-list-action"
                      className="text-decoration-none"
                      onClick={() => {
                        setShowDeleted(false);
                        fetchData(false, true);
                      }}
                    >
                      Show active portfolios
                    </a>
                  ) : (
                    <a
                      id="switch-portfolio-list-action"
                      className="text-decoration-none"
                      onClick={() => {
                        setShowDeleted(true);
                        fetchData(true, true);
                      }}
                    >
                      Show deleted portfolios
                    </a>
                  )}
                </div>
              </Col>
              <Col xs={8}>
                {activePortfolio && (
                  <PortfolioDetail
                    item={activePortfolio}
                    onHardDelete={onItemHardDelete}
                    onDelete={onItemDelete}
                    onRestore={onItemRestore}
                    onUpdate={onItemUpdate}
                    onMakeDefault={onItemMakeDefault}
                  />
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
