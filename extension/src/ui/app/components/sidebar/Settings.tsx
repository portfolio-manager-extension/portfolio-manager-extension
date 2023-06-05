import React from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import UIEventDispatcher from "../../../UIEventDispatcher";
import { ExtensionRepository } from "../../../../storage/ExtensionRepository";
import AccountOverview from "./AccountOverview";

type Props = {
  account: Extension.Account;
  settings: Extension.Settings;
};

export default function Settings({ settings: currentSettings, account }: Props) {
  const hideDetails = currentSettings.hideSettingsDetails;

  async function updateSettings(input: Partial<Extension.Settings>) {
    const extensionRepository = new ExtensionRepository();
    const newSettings = Object.assign({}, currentSettings, input);
    await extensionRepository.saveSettings(newSettings);
    UIEventDispatcher.dispatchSettingsChanged(newSettings);
  }

  async function lock() {
    await updateSettings({ locked: true });
    location.href = "#/";
  }

  return (
    <Card id="settings-card" className="sidebar-card">
      <Card.Header>
        <ButtonGroup className="w-100">
          <Button variant="warning" className="w-75" onClick={(e) => lock()}>
            <i className="fa fa-lock dim"></i>
            Lock
          </Button>
          <Button variant="secondary" onClick={() => updateSettings({ hideSettingsDetails: !hideDetails })}>
            <i className={hideDetails ? "fa fa-angle-right" : "fa fa-angle-down"}></i>
          </Button>
        </ButtonGroup>
      </Card.Header>

      {!hideDetails && (
        <Card.Body>
          <AccountOverview account={account} />
          <div>
            <Form.Check
              type="switch"
              label="Censor all sensitive data"
              checked={currentSettings.censorSensitiveData}
              onChange={(e) => updateSettings({ censorSensitiveData: e.target.checked })}
            />
            <Form.Check
              type="switch"
              label="Set page size to fixed"
              checked={currentSettings.useFixedPageSize}
              onChange={(e) => updateSettings({ useFixedPageSize: e.target.checked })}
            />
            {!account.subscribed && (
              <Form.Check
                type="switch"
                label="Show trial message"
                checked={currentSettings.showTrialMessage}
                onChange={(e) => updateSettings({ showTrialMessage: e.target.checked })}
              />
            )}
            <Form.Check
              type="switch"
              label="Hide extension's documents"
              checked={currentSettings.hideExtensionDocuments}
              onChange={(e) => updateSettings({ hideExtensionDocuments: e.target.checked })}
            />
            <Form.Check
              type="switch"
              label="Hide all explanations"
              checked={currentSettings.hideAllExplanations}
              onChange={(e) => updateSettings({ hideAllExplanations: e.target.checked })}
            />
          </div>
        </Card.Body>
      )}
    </Card>
  );
}
