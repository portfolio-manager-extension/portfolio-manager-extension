import React, { PropsWithChildren } from "react";
import MainNav, { MainNavItem } from "./MainNav";
import EmptyHeader from "../header/EmptyHeader";
import Copyright from "../sidebar/Copyright";
import WhitePaperLinks from "../sidebar/WhitePaperLinks";
import LinkFactory from "../../../LinkFactory";

type Props = PropsWithChildren & {
  locale: Locale;
  hasAccount: boolean;
  settings: Extension.Settings;
  mainNavItems: MainNavItem[];
};

export default function EmptyPageTemplate({ locale, settings, mainNavItems, hasAccount, children }: Props) {
  const links = LinkFactory.make(locale, false);

  return (
    <>
      <EmptyHeader
        version={settings.version}
        useFixedPageSize={settings.useFixedPageSize}
        locale={locale}
        hasAccount={hasAccount}
      />
      <MainNav items={mainNavItems} useFixedPageSize={settings.useFixedPageSize} />
      <main className={settings.useFixedPageSize ? "container" : "container-fluid"}>
        <div className="row">
          <div className="col col-12 col-sm-12 col-md-4 col-lg-3 col-xl-3 order-1 order-md-2">
            <div id="content-page-sidebar-links">
              <WhitePaperLinks links={links} showInternalDocumentLinks={false} />
            </div>
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
