import React, { useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import AvailableInstrument from "./AvailableInstrument";
import AssignedInstrument from "./AssignedInstrument";
import { getEmptyManageInstrumentsData, getManageInstrumentsData } from "./data/getManageInstrumentsData";
import StorageFactory from "../../../../../storage/StorageFactory";
import update from "immutability-helper";
import { useDrop } from "react-dnd";

type Props = {
  account: Extension.Account;
  portfolioId: string;
  onPortfolioChanged: () => void;
};

export default function ManageInstrumentsButton({ account, portfolioId, onPortfolioChanged }: Props) {
  const [show, setShow] = useState(false);
  const [data, setData] = useState<App.Portfolio.ManageInstrumentsData>(getEmptyManageInstrumentsData());
  const [loadCount, setLoadCount] = useState(0);
  const [filterTerm, setFilterTerm] = useState("");
  const [onlyShowPositionNotInAnyPortfolio, setOnlyShowPositionNotInAnyPortfolio] = useState(true);
  const [onlyShowHolding, setOnlyShowHolding] = useState(true);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (show) {
      (async () => {
        setData(await getManageInstrumentsData(account, { portfolioId }));
      })();
    }
  }, [show, loadCount]);

  function onHideHandler() {
    setShow(false);
    if (hasChanged) {
      onPortfolioChanged();
    }
  }

  async function onAvailableItemClick(item: App.Portfolio.AvailableInstrumentItem) {
    const repository = StorageFactory.makePortfolioInstrumentRepository(account);
    await repository.addToPortfolio(portfolioId, item.isin);
    setHasChanged(true);
    setLoadCount(loadCount + 1);
  }

  async function onDeleteClick(item: App.Portfolio.AssignedInstrumentItem) {
    const repository = StorageFactory.makePortfolioInstrumentRepository(account);
    await repository.removeFromPortfolio(portfolioId, item.isin);
    setHasChanged(true);
    setLoadCount(loadCount + 1);
  }

  const findInstrument = useCallback(
    (id: string) => {
      const item = data.assignedItems.filter((c) => `${c.id}` === id)[0] as App.Portfolio.AssignedInstrumentItem;
      return {
        item,
        index: data.assignedItems.indexOf(item),
      };
    },
    [data]
  );

  const moveInstrument = useCallback(
    (id: string, atIndex: number) => {
      const { item, index } = findInstrument(id);
      setData({
        availableItems: data.availableItems,
        assignedItems: update(data.assignedItems, {
          $splice: [
            [index, 1],
            [atIndex, 0, item],
          ],
        }),
      });
    },
    [findInstrument, data, setData]
  );

  async function onDnDEnd() {
    let order = 1;
    const repository = StorageFactory.makePortfolioInstrumentRepository(account);
    for (const item of data.assignedItems) {
      await repository.updateOrder(item.id, order);
      order++;
    }
    setHasChanged(true);
    setLoadCount(loadCount + 1);
  }

  const [, drop] = useDrop(() => ({ accept: "portfolio-item" }));
  return (
    <>
      <Button variant="primary" className="float-end" onClick={() => setShow(true)}>
        Manage Instruments
      </Button>
      <Modal show={show} onHide={onHideHandler} id="manage-positions" dialogClassName="modal-90w">
        <Modal.Header closeButton>
          <Modal.Title>Manage Portfolio's instruments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col xs={6}>
              <Row className="align-items-center">
                <Form.Group as={Col} xs={12}>
                  <Form.Control
                    autoFocus
                    placeholder="Type to filter..."
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                  />
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={7} className="mt-2" controlId="only-show-not-assigned-instruments">
                  <Form.Check
                    type="checkbox"
                    label="Only show positions not in any portfolio"
                    checked={onlyShowPositionNotInAnyPortfolio}
                    onChange={(e) => setOnlyShowPositionNotInAnyPortfolio(e.target.checked)}
                  />
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={5} className="mt-2" controlId="only-show-holding-instruments">
                  <Form.Check
                    type="checkbox"
                    label="Only show holding instruments"
                    checked={onlyShowHolding}
                    onChange={(e) => setOnlyShowHolding(e.target.checked)}
                  />
                </Form.Group>
              </Row>
              <ul className="available-instrument-list list-group mt-3">
                {!onlyShowHolding && (
                  <div className="alert alert-info">
                    If you would like to add an instrument that you are not currently holding, please follow these
                    instructions:
                    <ol className="mt-2 mb-2">
                      <li>
                        Visit{" "}
                        <a target="_blank" className="text-decoration-none" href="https://app.traderepublic.com/">
                          app.traderepublic.com
                        </a>
                      </li>
                      <li>Search an instrument you wish to add.</li>
                      <li>Click on the star icon to add it to your Favorites.</li>
                      <li>Navigate to your Favorites list.</li>
                      <li>
                        When you return to this page and refresh, you will see all of your favorite instruments listed.
                      </li>
                    </ol>
                    By following these steps, you will be able to add instruments to your portfolio that you are not
                    currently holding.
                  </div>
                )}
                {data.availableItems
                  .filter(function (item) {
                    let match = true;
                    if (onlyShowPositionNotInAnyPortfolio) {
                      match = item.portfolioNames.length == 0;
                    }
                    if (match && onlyShowHolding) {
                      match = item.holding;
                    }
                    if (match && filterTerm != "") {
                      match = item.name.toLowerCase().indexOf(filterTerm.toLowerCase()) != -1;
                    }
                    return match;
                  })
                  .map((item, index) => {
                    return <AvailableInstrument item={item} key={index} onAvailableItemClick={onAvailableItemClick} />;
                  })}
              </ul>
            </Col>
            <Col xs={6}>
              <h5 className="text-center text-muted" style={{ lineHeight: "38px" }}>
                Positions in current portfolio
              </h5>
              <ul ref={drop} className="assigned-instrument-list list-group" style={{ marginTop: "50px" }}>
                {data.assignedItems.map((item, index) => {
                  const prevIndex = index - 1;
                  const nextIndex = index + 1;
                  let prevItem: [string, number] | null =
                    prevIndex < 0 || prevIndex >= data.assignedItems.length
                      ? null
                      : [data.assignedItems[prevIndex].id, data.assignedItems[prevIndex].order];
                  let nextItem: [string, number] | null =
                    nextIndex < 0 || nextIndex >= data.assignedItems.length
                      ? null
                      : [data.assignedItems[nextIndex].id, data.assignedItems[nextIndex].order];

                  return (
                    <AssignedInstrument
                      key={index}
                      prevItem={prevItem}
                      nextItem={nextItem}
                      item={item}
                      onDeleteClick={onDeleteClick}
                      moveInstrument={moveInstrument}
                      findInstrument={findInstrument}
                      onDnDEnd={onDnDEnd}
                    />
                  );
                })}
              </ul>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
}
