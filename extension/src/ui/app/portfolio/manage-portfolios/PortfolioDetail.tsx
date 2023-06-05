import React, { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

type Props = {
  item: App.Portfolio.ManagePortfoliosItem;
  onHardDelete: (item: App.Portfolio.ManagePortfoliosItem) => void;
  onDelete: (item: App.Portfolio.ManagePortfoliosItem) => void;
  onRestore: (item: App.Portfolio.ManagePortfoliosItem) => void;
  onUpdate: (item: App.Portfolio.ManagePortfoliosItem, data: { name: string }) => void;
  onMakeDefault: (item: App.Portfolio.ManagePortfoliosItem) => void;
};

export default function PortfolioDetail({ item, onHardDelete, onDelete, onRestore, onUpdate, onMakeDefault }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);

  return (
    <div id="portfolio-detail">
      <div className="detail-header d-flex flex-grow-1">
        <h5 className="flex-grow-1">{item.name}</h5>
        {!item.isDefault && item.status == "active" && (
          <a className="text-decoration-none" onClick={() => onMakeDefault(item)}>
            make default
          </a>
        )}
      </div>
      <div className="mt-2">
        <Form id="portfolio-form">
          <Form.Group as={Row} className="mb-3" controlId="name">
            <Form.Label column sm={3}>
              Name
            </Form.Label>
            <Col sm={9}>
              {editing ? (
                <Form.Control
                  autoFocus
                  autoComplete="off"
                  type="text"
                  placeholder="Please enter a short and descriptive name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <div className="form-control-plaintext">{item.name}</div>
              )}
            </Col>
          </Form.Group>
          <div className="row">
            {item.status == "active" ? (
              <div className="col-sm-9 offset-sm-3">
                {editing ? (
                  <>
                    <a className="btn btn-secondary" onClick={() => setEditing(false)} style={{ marginRight: "1rem" }}>
                      Cancel
                    </a>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={() => {
                        onUpdate(item, { name });
                        setEditing(false);
                      }}
                      form="portfolio-form"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setName(item.name);
                      setEditing(true);
                    }}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="btn btn-outline-danger"
                  style={{ marginLeft: "1rem", border: 0 }}
                  onClick={() => onDelete(item)}
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="col-sm-9 offset-sm-3">
                <button className="btn btn-primary" onClick={() => onRestore(item)}>
                  Restore
                </button>
                <button className="btn btn-danger" style={{ marginLeft: "1rem" }} onClick={() => onHardDelete(item)}>
                  Delete forever
                </button>
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
