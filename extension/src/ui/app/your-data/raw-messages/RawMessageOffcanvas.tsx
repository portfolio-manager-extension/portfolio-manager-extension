import React, { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import StorageFactory from "../../../../storage/StorageFactory";
import RawMessageForm from "./RawMessageForm";
import { ProcessorManager } from "../../../../processor/ProcessorManager";

type Props = {
  account: Extension.Account;
  show: boolean;
  closeHandler: () => void;
  reloadHandler: () => void;
  item: App.YourData.RawMessageItem;
};
export default function RawMessageOffcanvas({ show, closeHandler, item, account, reloadHandler }: Props) {
  const [entity, setEntity] = useState<RawEntity.Message | undefined>(undefined);

  useEffect(function () {
    (async function () {
      if (typeof item !== "undefined") {
        const repository = StorageFactory.makeMessageRepository(account);
        setEntity(await repository.findById(item.id));
      }
    })();
  });

  if (typeof item === "undefined") {
    return <></>;
  }

  async function reprocessData() {
    if (typeof item !== "undefined") {
      const processorManager = new ProcessorManager(StorageFactory);
      await processorManager.reprocess(item.id, account);
      reloadHandler();
    }
  }

  return (
    <Offcanvas
      id="raw-message-offcanvas"
      show={show}
      onHide={closeHandler}
      placement="end"
      scroll={true}
      backdrop={false}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          Raw Message
          <div className="text-muted fw-light" style={{ fontSize: "0.8rem" }}>
            {item.id}
          </div>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {entity ? (
          <RawMessageForm account={account} item={entity} onDeleted={() => reloadHandler()} />
        ) : (
          <i className="fa fa-spin fa-spinner"></i>
        )}
      </Offcanvas.Body>
      <div className="offcanvas-footer justify-content-end">
        <div className="align-right">
          <button className="btn btn-secondary" style={{ marginRight: "1rem" }} onClick={closeHandler}>
            Close
          </button>
          <button className="btn btn-primary" onClick={reprocessData}>
            {item.status == "unprocessed" ? "Process data" : "Reprocess data"}
          </button>
        </div>
      </div>
    </Offcanvas>
  );
}
