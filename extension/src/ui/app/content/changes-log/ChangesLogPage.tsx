import React from "react";
import { useLoaderData } from "react-router-dom";
import { getMainNavItems } from "../getMainNavItems";
import EmptyPageTemplate from "../../components/lib/EmptyPageTemplate";

export default function ChangesLogPage() {
  const loaderData = useLoaderData() as App.ContentPageLoaderData;

  return (
    <EmptyPageTemplate
      mainNavItems={getMainNavItems(loaderData.locale, "changes-log")}
      locale={loaderData.locale}
      settings={loaderData.settings}
      hasAccount={loaderData.hasAccount}
    >
      <div>
        <h4>v0.7.0 - The First Public Release Ever 🎉</h4>
        <ul style={{ lineHeight: "1.8rem" }}>
          <li>Introducing a simple 1-click setup process, requiring no email or password.</li>
          <li>Automatic data collection within the Trade Republic page for seamless tracking.</li>
          <li>
            Activities menu: Trading, Dividend, Interest, Cash in and out, providing easy monitoring and visualization
            of your account.
          </li>
          <li>
            Portfolios menu: "All Positions" view for a quick overview of your holdings with an allocated treemap.
          </li>
          <li>
            Custom portfolio feature allowing you to manage your positions by grouping them into smaller and more
            meaningful categories.
          </li>
          <li>Transactions view for each instrument, enabling better understanding of your buys and sells.</li>
          <li>Raw Messages, displaying all the data we collected from your depot for comprehensive insights.</li>
          <li>
            Export & Import: Your data is yours, and you have the freedom to opt in or opt out whenever you like, with
            the ability to export and import your data.
          </li>
        </ul>
        <p>
          We're thrilled to offer these additional features to further empower you in managing your portfolio. Enjoy the
          flexibility and control over your data!
        </p>
      </div>
    </EmptyPageTemplate>
  );
}
