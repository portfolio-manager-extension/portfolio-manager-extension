import React from "react";
import { Link } from "react-router-dom";
import LinkFactory from "../../LinkFactory";
import WhitePaperLinks from "../components/sidebar/WhitePaperLinks";
import UIEventDispatcher from "../../UIEventDispatcher";
import { ExtensionRepository } from "../../../storage/ExtensionRepository";
import Copyright from "../components/sidebar/Copyright";

type Props = {
  accounts: Extension.Account[];
  settings: Extension.Settings;
};

export default function LobbyLinks({ accounts, settings }: Props) {
  async function updateSettings(input: Partial<Extension.Settings>) {
    const extensionRepository = new ExtensionRepository();
    const currentSettings = await extensionRepository.getSettings();
    const newSettings = Object.assign(currentSettings, input);
    await extensionRepository.saveSettings(newSettings);
    UIEventDispatcher.dispatchSettingsChanged(newSettings);
  }

  async function unlock(e: any) {
    e.preventDefault();
    await updateSettings({ locked: false });
    location.href = e.target.getAttribute("href");
  }

  return (
    <div id="lobby-links">
      {accounts.map((item, index) => {
        return (
          <Link
            key={index}
            to={LinkFactory.getPageWhenLoggingOrRedirectingFromLobby(item)}
            onClick={(e) => unlock(e)}
            className="account-login btn btn-primary"
          >
            <i className="fa fa-sign-in-alt dim"></i>
            {settings.censorSensitiveData ? "Open your account" : item.source.name.first + " " + item.source.name.last}
          </Link>
        );
      })}
      <div className="d-none d-sm-none d-md-block">
        <WhitePaperLinks links={LinkFactory.make("en", false)} />
      </div>
      <Copyright sidebar={true} version={settings.version} />
    </div>
  );
}
