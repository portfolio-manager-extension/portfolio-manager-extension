import * as ReactDOM from "react-dom/client";
import React, { StrictMode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createHashRouter, Outlet, RouterProvider } from "react-router-dom";
import UIEventDispatcher from "../UIEventDispatcher";
import { accountPageLoader } from "./fn/accountPageLoader";
import { contentPageLoader } from "./fn/contentPageLoader";
import WelcomePage from "./content/welcome/WelcomePage";
import LobbyPage, { lobbyLoader } from "./lobby/LobbyPage";
import InterestPage from "./activities/interest/InterestPage";
import RawMessagesPage from "./your-data/raw-messages/RawMessagesPage";
import ProcessedDataPage from "./your-data/processed-data/ProcessedDataPage";
import DisclaimerPage from "./content/disclaimer/DisclaimerPage";
import HowItWorksPage from "./content/how-it-works/HowItWorksPage";
import TermsOfServicePage from "./content/terms-of-service/TermsOfServicePage";
import CollectedDataPage from "./content/collected-data/CollectedDataPage";
import ChangesLogPage from "./content/changes-log/ChangesLogPage";
import ExportPage from "./your-data/export/ExportPage";
import ImportPage from "./your-data/import/ImportPage";
import CashFlowPage from "./activities/cash-flow/CashFlowPage";
import DividendPage from "./activities/dividend/DividendPage";
import AllPositionsPage from "./portfolio/all-positions/AllPositionsPage";
import CustomPortfolioPage from "./portfolio/custom-portfolio/CustomPortfolioPage";
import AccountPage from "./your-data/account/AccountPage";
import ManagePortfoliosPage from "./portfolio/manage-portfolios/ManagePortfoliosPage";
import TradingPage from "./activities/trading/TradingPage";

function debug(cb: (input: any) => any): (input: any) => any {
  return function (input) {
    console.debug("Current URL is", location.href.substring(location.href.indexOf("#")), "route data", input);
    return cb.call(undefined, input);
  };
}

const router = createHashRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      {
        index: true,
        path: "/",
        element: <LobbyPage />,
        loader: debug(lobbyLoader),
      },
      {
        path: ":accountType/:accountId/portfolio/all-positions",
        element: <AllPositionsPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/portfolio/custom/:portfolioId/:instrumentId?",
        element: <CustomPortfolioPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/manage-portfolios",
        element: <ManagePortfoliosPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/activities/trading",
        element: <TradingPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/activities/dividend",
        element: <DividendPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/activities/interest",
        element: <InterestPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/activities/cash-in-and-out",
        element: <CashFlowPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/your-data/raw-messages",
        element: <RawMessagesPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/your-data/processed-data",
        element: <ProcessedDataPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/your-data/import",
        element: <ImportPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/your-data/export",
        element: <ExportPage />,
        loader: debug(accountPageLoader),
      },
      {
        path: ":accountType/:accountId/your-data/account",
        element: <AccountPage />,
        loader: debug(accountPageLoader),
      },

      { path: ":locale/welcome", element: <WelcomePage />, loader: debug(contentPageLoader) },
      { path: ":locale/disclaimer", element: <DisclaimerPage />, loader: debug(contentPageLoader) },
      { path: ":locale/how-it-works", element: <HowItWorksPage />, loader: debug(contentPageLoader) },
      { path: ":locale/terms-of-service", element: <TermsOfServicePage />, loader: debug(contentPageLoader) },
      { path: ":locale/collected-data-and-reasons", element: <CollectedDataPage />, loader: debug(contentPageLoader) },
      { path: ":locale/changes-log", element: <ChangesLogPage />, loader: debug(contentPageLoader) },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <DndProvider backend={HTML5Backend}>
      <RouterProvider router={router} />
    </DndProvider>
  </StrictMode>
);

(function () {
  window.addEventListener("unload", function () {
    try {
      UIEventDispatcher.removeTab();
    } catch (error) {}
  });
})();
