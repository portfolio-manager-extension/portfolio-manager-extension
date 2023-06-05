import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useLoaderData } from "react-router-dom";
import { pageEffect } from "../../fn/pageEffect";
import { getMainNavItems } from "../getMainNavItems";
import PageTemplate from "../../components/lib/PageTemplate";
import MainFunctionality from "../../components/lib/MainFunctionality";
import Form from "react-bootstrap/Form";
import Formatter from "../../Formatter";
import Checkout from "./Checkout";
import SubscribedPackage from "./SubscribedPackage";
export default function AccountPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);

    return () => {
      removeFn.call(undefined);
    };
  }, []);

  const formatter = new Formatter(loaderData.account.locale, loaderData.account.defaultCurrency);

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, "account")}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="your-data"
      showSubscribeButton={false}
    >
      <MainFunctionality loading={false} hasData={true} noDataComponent={<div />}>
        <Row>
          <Col xs={12} sm={{ span: 6, offset: 3 }}>
            <div>
              <h3>
                Essential data
                <span className="text-muted" style={{ fontSize: "0.9rem", marginLeft: "0.5rem", fontWeight: "normal" }}>
                  (we collected this data)
                </span>
              </h3>
            </div>
            <Form.Group className="mb-1 mt-2">
              <Form.Label>Your Account ID</Form.Label>
              <Form.Control disabled value={loaderData.account.source.id} />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Created at</Form.Label>
              <Form.Control disabled value={formatter.datetime(loaderData.account.createdAt)} />
              <Form.Text muted>{formatter.relativeTime(loaderData.account.createdAt, "day")}</Form.Text>
            </Form.Group>

            {loaderData.account.subscribed ? (
              <SubscribedPackage account={loaderData.account} />
            ) : (
              <Checkout account={loaderData.account} />
            )}
          </Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
