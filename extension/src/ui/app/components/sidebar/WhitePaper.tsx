import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import { ExtensionRepository } from "../../../../storage/ExtensionRepository";
import UIEventDispatcher from "../../../UIEventDispatcher";
import LinkFactory from "../../../LinkFactory";
import { Link } from "react-router-dom";
import WhitePaperLinks from "./WhitePaperLinks";

type Props = {
  settings: Extension.Settings;
  account: Extension.Account;
};

export default function WhitePaper({ settings: currentSettings, account }: Props) {
  const hideDetails = currentSettings.hideExtensionDocumentsDetails;
  const links = LinkFactory.make(account.locale, false);

  async function updateSettings(input: Partial<Extension.Settings>) {
    const extensionRepository = new ExtensionRepository();
    const newSettings = Object.assign({}, currentSettings, input);
    await extensionRepository.saveSettings(newSettings);
    UIEventDispatcher.dispatchSettingsChanged(newSettings);
  }

  const text = "We don't mess with your data, please read documents below to fully understand how the extension works.";

  if (hideDetails) {
    return (
      <Card id="white-paper-card" className="sidebar-card">
        <Card.Header>
          {text}
          <br />
          <br />
          <a
            className="text-decoration-none"
            onClick={() => updateSettings({ hideExtensionDocumentsDetails: !hideDetails })}
          >
            Show extension documents
          </a>
        </Card.Header>
      </Card>
    );
  }

  return (
    <Card id="white-paper-card" className="sidebar-card">
      <Card.Header>
        {text}
        <br />
        <br />
        <a
          className="text-decoration-none"
          onClick={() => updateSettings({ hideExtensionDocumentsDetails: !hideDetails })}
        >
          Hide extension documents
        </a>
      </Card.Header>

      <Card.Body>
        <WhitePaperLinks links={links} />
      </Card.Body>
    </Card>
  );
}
