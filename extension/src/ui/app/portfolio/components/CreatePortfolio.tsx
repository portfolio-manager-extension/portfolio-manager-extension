import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import StorageFactory from "../../../../storage/StorageFactory";
import LinkFactory from "../../../LinkFactory";

type Props = {
  account: Extension.Account;
  onCreated?: (portfolio: CustomEntity.Portfolio) => void;
};

export default function CreatePortfolio({ account, onCreated }: Props) {
  const [show, setShow] = useState(false);
  const [inputName, setInputName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function onHideHandler() {
    setErrorMessage("");
    setInputName("");
    setShow(false);
  }

  function onNameChanged(e: any) {
    setInputName(e.target.value);
  }

  async function onFormSubmit(e: any) {
    e.preventDefault();
    const name = inputName.trim();
    if (name != "" && name.length > 2) {
      try {
        const repository = StorageFactory.makePortfolioRepository(account);
        const portfolio = await repository.create(name);
        setErrorMessage("");
        setInputName("");
        setShow(false);
        location.href = "#" + LinkFactory.getPortfolioLink(account, portfolio.id);
        if (typeof onCreated !== "undefined") {
          onCreated.call(undefined, portfolio);
        }
        // @ts-ignore
      } catch (error: Error) {
        setErrorMessage(error.message);
      }
      return;
    }

    setErrorMessage("Please enter portfolio name with at least 3 characters");
  }

  return (
    <>
      <Button
        variant="outline-secondary"
        size="sm"
        style={{ borderColor: "transparent" }}
        onClick={() => setShow(true)}
      >
        <i className="fa-solid fa-plus dim"></i>
        Create portfolio
      </Button>
      <Modal show={show} onHide={onHideHandler} id="create-portfolio-modal" dialogClassName="modal-60w">
        <Modal.Header closeButton>
          <Modal.Title>Create new portfolio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate id="create-portfolio-form" className="align-right-form" onSubmit={onFormSubmit}>
            <Form.Group className="mb-3" controlId="portfolioName">
              <Form.Label>Portfolio name</Form.Label>
              <Form.Control
                autoFocus
                autoComplete="off"
                type="text"
                placeholder="Please enter a short and descriptive name"
                value={inputName}
                onChange={onNameChanged}
              />
              {errorMessage != "" && (
                <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
                  {errorMessage}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHideHandler}>
            Cancel
          </Button>
          <Button variant="primary" form="create-portfolio-form">
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
