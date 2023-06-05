import React from "react";
import { ExtensionRepository } from "../../../storage/ExtensionRepository";
import { redirect, useLoaderData } from "react-router-dom";
import LinkFactory from "../../LinkFactory";
import UIEventDispatcher from "../../UIEventDispatcher";
import LobbyLinks from "./LobbyLinks";
import Copyright from "../components/sidebar/Copyright";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import LobbyTasks from "./LobbyTasks";
import { ButtonToolbar } from "react-bootstrap";

export default function LobbyPage() {
  let data = useLoaderData() as App.LoaderData;

  // const tabOptions = (
  //   <li className="nav-item" style={{marginLeft:'auto'}}>
  //     <ButtonToolbar>
  //       <ButtonGroup size='sm' aria-label="Basic example">
  //         <Button variant="secondary">Left</Button>
  //         <Button variant="secondary">Middle</Button>
  //         <Button variant="secondary">Right</Button>
  //       </ButtonGroup>
  //     </ButtonToolbar>
  //   </li>
  // )
  return (
    <div id="lobby-container">
      <div id="lobby-content" className="container">
        <div className="row">
          <div className="col col-12 col-sm-12 col-md-5 col-lg-4 col-xl-4 order-1 order-md-2 mb-3 mb-md-0">
            <LobbyLinks accounts={data.accounts} settings={data.settings} />
          </div>
          <div className="col col-12 col-sm-12 col-md-7 col-lg-8 col-xl-8 order-2 order-md-1">
            <div id="lobby-utilities">
              <Tab.Container defaultActiveKey="tasks">
                <Nav as="ul" className="nav-tabs">
                  <Nav.Item as="li">
                    <Nav.Link className="nav-link" eventKey="tasks">
                      Todo
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content>
                  <Tab.Pane eventKey="tasks">
                    <LobbyTasks />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </div>
            <Copyright sidebar={false} version={data.settings.version} />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function lobbyLoader({ params }: any): Promise<App.LoaderData | any> {
  const extensionRepository = new ExtensionRepository();
  const accounts = await extensionRepository.getAccounts();
  const settings = await extensionRepository.getSettings();

  if (accounts.length == 0) {
    UIEventDispatcher.registerTab("app", undefined);
    return redirect(LinkFactory.getWelcomePage());
  }
  if (!settings.locked) {
    document.body.classList.remove("lobby");
    document.title = "Portfolio Management Extension";
    return redirect(LinkFactory.getPageWhenLoggingOrRedirectingFromLobby(accounts[0]));
  }

  document.body.classList.add("lobby");
  document.title = "New Tab";
  return {
    accounts,
    settings,
  };
}
