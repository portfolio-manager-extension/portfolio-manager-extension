import React from "react";
import PopupTranslationFactory from "../PopupTranslationFactory";
import LinkFactory from "../../LinkFactory";
import UIEventDispatcher from "../../UIEventDispatcher";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import ListGroup from "react-bootstrap/ListGroup";

const LINK_APP_TR = "https://app.traderepublic.com";

function openLink(url: string) {
  if (url != "") {
    UIEventDispatcher.openLink(url);
  }
}

type Props = {
  locale: Locale;
};

export default function NoAccount({ locale }: Props) {
  const translationFactory = new PopupTranslationFactory();
  const links = LinkFactory.make(locale, true);
  const translations = translationFactory.make(locale);

  return (
    <Row className="no-account-wrapper">
      <Col>
        <Alert variant="info">{translations.noAccount.infoText}</Alert>

        <ListGroup>
          <ListGroup.Item action variant="primary" onClick={() => openLink(LINK_APP_TR)}>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            {translations.noAccount.openTradeRepublicApp}
          </ListGroup.Item>
          <ListGroup.Item action variant="secondary" onClick={() => openLink(links.howItWorks)}>
            <i className="fa-solid fa-book"></i>
            {translations.noAccount.learnHowItWork}
          </ListGroup.Item>
          <ListGroup.Item action variant="secondary" onClick={() => openLink(links.collectedData)}>
            <i className="fa-regular fa-file"></i>
            {translations.noAccount.collectedData}
          </ListGroup.Item>
          <ListGroup.Item action variant="secondary" onClick={() => openLink(links.githubSourceCode)}>
            <i className="fa-brands fa-github"></i>
            {translations.noAccount.viewSourceCode}
          </ListGroup.Item>
          <ListGroup.Item action variant="success" onClick={() => openLink(links.buyMeACoffee)}>
            <i className="fa-solid fa-mug-saucer"></i>
            {translations.noAccount.buyMeACoffee}
          </ListGroup.Item>
          <ListGroup.Item action variant="danger" onClick={() => openLink(links.disclaimer)}>
            <i className="fa-solid fa-xmark"></i>
            {translations.noAccount.disclaimer}
          </ListGroup.Item>
        </ListGroup>
      </Col>
    </Row>
  );
}
