import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

type Props = {
  account: Extension.Account;
};

export default function SubscribedPackage({ account }: Props) {
  if (!account.subscribed) {
    return null;
  }

  return (
    <Row className="mt-5">
      <Col xs={12} sm={{ span: 8, offset: 2 }}>
        <div className="package card shadow-sm">
          <div className="card-body">
            <div className="subscribed text-center text-success fs-4">
              <i className="fa fa-thumbs-up"></i>
              &nbsp; Subscribed
            </div>
            <div className="price" style={{ marginTop: "1rem" }}>
              <div className="py-2">
                <p className="h1 fw-bold mb-2">5,00 €</p>
                <p className="h6 text-muted">per month</p>
              </div>
            </div>
            <div className="features">
              <ul className="list-group">
                <li className="list-group-item">
                  <b>1</b> Trade Republic account
                </li>
                <li className="list-group-item">
                  <b>All</b> offline features
                </li>
                <li className="list-group-item">
                  <b>Full</b> email and ticket support
                </li>
              </ul>
            </div>
            <div className="subscribe">
              <p>Thank you for your support!</p>
              <p>
                If you encounter any issues or have any questions, please don't hesitate to reach out to us. You can
                contact us via email at{" "}
                <a className="text-decoration-none" href="mailto:portfolio.manager.extension@gmail.com">
                  portfolio.manager.extension@gmail.com
                </a>{" "}
                or utilize the "Report Issue / Ask a Question" link located on the right-hand side.
              </p>
              <p>We are here to assist you and provide any necessary help or guidance.</p>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}
