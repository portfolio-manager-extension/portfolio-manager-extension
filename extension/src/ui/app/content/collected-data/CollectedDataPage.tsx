import React from "react";
import { useLoaderData } from "react-router-dom";
import { getMainNavItems } from "../getMainNavItems";
import EmptyPageTemplate from "../../components/lib/EmptyPageTemplate";

export default function CollectedDataPage() {
  const loaderData = useLoaderData() as App.ContentPageLoaderData;

  return (
    <EmptyPageTemplate
      mainNavItems={getMainNavItems(loaderData.locale, "collected-data")}
      locale={loaderData.locale}
      settings={loaderData.settings}
      hasAccount={loaderData.hasAccount}
    >
      <p style={{ lineHeight: "2rem" }}>
        We only store your Trade Republic's ID on our server (in the format{" "}
        <code>d8846d56-f66c-11ed-b67e-0242ac120002</code>) when you click 'Setup for this account' on the Trade Republic
        webpage. This information helps us determine when you started using our extension.
      </p>

      <p style={{ lineHeight: "2rem" }}>
        When you subscribe to our service, we will store your email address for the purpose of providing assistance in
        case you wish to cancel your subscription. In such cases, we will send you an email with instructions on how to
        cancel. Please be assured that we do not send any promotional emails without your explicit consent or knowledge.
      </p>

      <p style={{ lineHeight: "2rem" }}>
        We want to assure you that we do not store any other kind of data without your knowledge or confirmation. In
        fact, we do not use any analytic tools such as Google Analytics to monitor your behavior in the background. We
        believe in your awesomeness, and if you ever find something that needs improvement, please let us know.
      </p>
    </EmptyPageTemplate>
  );
}
