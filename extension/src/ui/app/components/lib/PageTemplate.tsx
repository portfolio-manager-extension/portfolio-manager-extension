import React, { PropsWithChildren, useEffect, useState } from "react";
import MainNav, { MainNavItem } from "./MainNav";
import Settings from "../sidebar/Settings";
import Header from "../header/Header";
import SubscribeMessage from "./SubscribeMessage";
import WhitePaper from "../sidebar/WhitePaper";
import Copyright from "../sidebar/Copyright";

type Props = PropsWithChildren & {
  account: Extension.Account;
  settings: Extension.Settings;
  portfolios: CustomEntity.Portfolio[];
  mainNavItems: MainNavItem[];
  mainNavLeftAction?: React.ComponentElement<any, any>;
  mainNavRightAction?: React.ComponentElement<any, any>;
  selectedMenu: "activities" | "portfolio" | "analytics" | "your-data";
  showSubscribeButton?: boolean;
};

export default function PageTemplate({
  account,
  settings,
  portfolios,
  mainNavItems,
  mainNavLeftAction,
  mainNavRightAction,
  children,
  selectedMenu,
  showSubscribeButton,
}: Props) {
  return (
    <>
      <Header
        version={settings.version}
        useFixedPageSize={settings.useFixedPageSize}
        account={account}
        portfolios={portfolios}
        selectedMenu={selectedMenu}
        showSubscribeButton={showSubscribeButton}
      />
      <SubscribeMessage
        account={account}
        showTrialMessage={settings.showTrialMessage}
        useFixedPageSize={settings.useFixedPageSize}
      />
      <MainNav
        items={mainNavItems}
        leftAction={mainNavLeftAction}
        rightAction={mainNavRightAction}
        useFixedPageSize={settings.useFixedPageSize}
      />
      <main className={settings.useFixedPageSize ? "container" : "container-fluid"}>
        <div className="row">
          <div className="col col-12 col-sm-12 col-md-4 col-lg-3 col-xl-3 order-1 order-md-2">
            <Settings settings={settings} account={account} />
            {!settings.hideExtensionDocuments && <WhitePaper settings={settings} account={account} />}
            <Copyright sidebar={true} />
          </div>
          <div className="col col-12 col-sm-12 col-md-8 col-lg-9 col-xl-9 order-2 order-md-1">
            {children}
            <Copyright sidebar={false} />
          </div>
        </div>
      </main>
    </>
  );
}
