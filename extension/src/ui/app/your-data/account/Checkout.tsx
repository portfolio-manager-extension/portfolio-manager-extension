import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

type GetPricesResponse = {
  data: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
  }>;
};
type CreateSubscriptResponse = {
  data: {
    payment_link: string;
  };
};

type Props = {
  account: Extension.Account;
};

const BASE_URL = "https://portfolio-manager-extension.com";
const TIMEOUT = 3000;
const BASIC_NAME = "basic-monthly";
const BASIC_PRICE = 5;

export default function Checkout({ account }: Props) {
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [priceId, setPriceId] = useState("");

  useEffect(() => {
    (async () => {
      await fetchPrice();
    })();
  }, []);

  async function fetchPrice() {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), TIMEOUT);
    const getStream = await fetch(`${BASE_URL}/api/v1/subscription/prices`, {
      signal: controller.signal,
    });
    const response: GetPricesResponse = await getStream.json();
    if (typeof response.data !== "undefined") {
      const priceByName = response.data.find(function (item) {
        return item.name == BASIC_NAME;
      });
      if (priceByName) {
        setPriceId(priceByName.id);
        setLoading(false);
        return;
      }
      const priceByValue = response.data.find(function (item) {
        return item.price == BASIC_PRICE;
      });
      if (priceByValue) {
        setPriceId(priceByValue.id);
        setLoading(false);
        return;
      }
    }
  }

  async function onCheckoutClick() {
    if (checkingOut) {
      return;
    }
    setCheckingOut(true);
    setHasError(false);
    const postStream = await fetch(`${BASE_URL}/api/v1/subscription/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_id: account.source.id,
        account_type: "TR",
        email: account.source.email,
        price_id: priceId,
      }),
      mode: "cors",
    });
    if (postStream.status == 200) {
      const response: CreateSubscriptResponse = await postStream.json();
      if (response.data.payment_link) {
        location.href = response.data.payment_link;
        return;
      }
    }
    setCheckingOut(false);
    setHasError(true);
  }

  if (loading) {
    return (
      <Row className="mt-5">
        <Col xs={12} sm={{ span: 8, offset: 2 }} className="text-center">
          <i className="fa fa-spin fa-spinner"></i>
        </Col>
      </Row>
    );
  }

  if (!priceId) {
    return (
      <Row className="mt-5">
        <Col xs={12} sm={{ span: 8, offset: 2 }} className="text-center">
          Sorry, there is an unknown error, please try again later.
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mt-5">
      <Col xs={12} sm={{ span: 8, offset: 2 }}>
        <div className="package card shadow-sm">
          <div className="card-body">
            <div className="price">
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
              {checkingOut ? (
                <a className="btn btn-primary w-100 text-center">
                  <i className="fa fa-spin fa-spinner"></i>
                </a>
              ) : (
                <a className="btn btn-primary w-100" onClick={() => onCheckoutClick()}>
                  <i className="fa fa-cart-shopping dim"></i>
                  Checkout with Stripe
                </a>
              )}
              {hasError && (
                <p className="mt-2 mb-2 text-danger text-center">There was an error, please try again later.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 text-muted" style={{ fontSize: "0.8rem", textAlign: "justify" }}>
          <p>
            When you click checkout, your email address ({account.source.email}) will be temporarily transmitted to our
            server. This email is then forwarded to Stripe to prefill and send the invoice to you.
          </p>

          <p>
            For the purpose of assisting you in canceling your subscription, <b>we will store your email address</b>. In
            the event that you decide to cancel, we will send you an email with detailed instructions. Rest assured that
            we do not send any promotional emails without your explicit consent or knowledge.
          </p>

          <p style={{ fontWeight: "bold" }}>
            Furthermore, please note that we do not collect or store any payment information within our system.
          </p>
        </div>
      </Col>
    </Row>
  );
}
