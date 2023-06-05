import React from "react";
import Card from "react-bootstrap/Card";
import PopupTranslationFactory from "../PopupTranslationFactory";
import UIEventDispatcher from "../../UIEventDispatcher";

type Props = {
  locale: Locale;
  data: Extension.Account;
};

function Account({ locale, data }: Props) {
  const translationsFactory = new PopupTranslationFactory();
  const translations = translationsFactory.make(locale);

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          {data.source.name.first}&nbsp;{data.source.name.last}
        </Card.Title>
        <Card.Subtitle className="text-muted mb-2">{data.source.email}</Card.Subtitle>

        <Card.Link className="btn btn-primary" onClick={() => UIEventDispatcher.openApp(data)}>
          {translations.hasAccounts.viewDataBtn}
        </Card.Link>
        <Card.Link className="btn btn-secondary" onClick={() => UIEventDispatcher.openTradeRepublic(data)}>
          {translations.hasAccounts.openTradeRepublic}
        </Card.Link>
      </Card.Body>
    </Card>
  );
}

type ListProps = {
  locale: Locale;
  accounts: Extension.Account[];
};

export default function Accounts({ locale, accounts }: ListProps) {
  return (
    <>
      {accounts.map((item) => {
        return <Account key={item.source.id} locale={locale} data={item} />;
      })}
    </>
  );
}
