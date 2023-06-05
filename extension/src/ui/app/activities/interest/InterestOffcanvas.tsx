import React, { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import StorageFactory from "../../../../storage/StorageFactory";
import OffcanvasData from "../../components/lib/OffcanvasData";
import ItemId from "../../components/lib/ItemId";
import InterestForm from "./InterestForm";
import InterestProcessedData from "./InterestProcessedData";

type Props = {
  account: Extension.Account;
  show: boolean;
  closeHandler: () => void;
  reloadHandler: () => void;
  item: App.Activity.InterestItem;
};
export default function InterestOffcanvas({ show, closeHandler, reloadHandler, item, account }: Props) {
  const [selectedTab, setSelectedTab] = useState<"processed" | "custom">("processed");
  const [customEntity, setCustomEntity] = useState<CustomEntity.Interest | undefined>(undefined);

  useEffect(
    function () {
      (async function () {
        if (typeof item !== "undefined") {
          const repository = StorageFactory.makeCustomInterestRepository(account);
          setCustomEntity(await repository.findById(item.id));
        }
      })();
    },
    [item]
  );

  if (typeof item === "undefined") {
    return <></>;
  }

  const form = (
    <InterestForm
      account={account}
      item={item}
      entity={customEntity}
      onSaved={reloadHandler}
      onDeleted={reloadHandler}
    />
  );
  const processedData = <InterestProcessedData item={item} />;

  return (
    <>
      <Offcanvas show={show} onHide={closeHandler} placement="end" scroll={true} backdrop={false}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            Interest earned
            <div className="standard-subtitle text-muted fw-light">
              <span className="date-time">Sat 01.04 at 05:45</span>
              <ItemId value={item.id} />
              <br />
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="use-tabs">
          <OffcanvasData
            customData={form}
            processedData={processedData}
            tab={selectedTab}
            onSelect={(key) => setSelectedTab(key)}
          />
        </Offcanvas.Body>

        {selectedTab === "custom" && (
          <div className="offcanvas-footer justify-content-end">
            <div className="align-right">
              <button className="btn btn-secondary" style={{ marginRight: "1rem" }} onClick={closeHandler}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" form="interest-form">
                Save
              </button>
            </div>
          </div>
        )}
      </Offcanvas>
    </>
  );
}
