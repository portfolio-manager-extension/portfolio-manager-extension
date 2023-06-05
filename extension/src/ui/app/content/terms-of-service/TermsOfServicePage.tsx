import React from "react";
import { useLoaderData } from "react-router-dom";
import { getMainNavItems } from "../getMainNavItems";
import EmptyPageTemplate from "../../components/lib/EmptyPageTemplate";

export default function TermsOfServicePage() {
  const loaderData = useLoaderData() as App.ContentPageLoaderData;

  return (
    <EmptyPageTemplate
      mainNavItems={getMainNavItems(loaderData.locale, "terms-of-service")}
      locale={loaderData.locale}
      settings={loaderData.settings}
      hasAccount={loaderData.hasAccount}
    >
      <ol style={{ lineHeight: "2rem" }}>
        <li>
          Use of Service: Our service provides users with a portfolio management extension. By using our service, you
          agree to comply with our terms and conditions.
        </li>
        <li>
          Intellectual Property: All materials provided by our service, including the extension and website content, are
          protected by intellectual property laws. Users are not permitted to reproduce, modify, or distribute our
          materials without prior written consent.
        </li>
        <li>
          Data Privacy: We only store your Trade Republic's ID on our server (in the format
          d8846d56-f66c-11ed-b67e-0242ac120002) when you click 'Setup for this account' on the Trade Republic webpage.
          This information helps us determine the time when you first set up an account, regardless of the computer you
          use. When you subscribe to our service, we will store your email address for the purpose of providing
          assistance in case you wish to cancel your subscription. In such cases, we will send you an email with
          instructions on how to cancel. Please be assured that we do not send any promotional emails without your
          explicit consent or knowledge. We do not store any other kind of data without your knowledge or confirmation.
          We do not use any analytic tools such as Google Analytics to monitor your behavior in the background. Your
          privacy and security are important to us.
        </li>
        <li>
          Limitation of Liability: Our service is provided on an "as-is" and "as-available" basis. We are not
          responsible for any damages that may result from the use of our service.
        </li>
        <li>
          Termination: We reserve the right to terminate access to our service at any time, for any reason, without
          notice.
        </li>
        <li>
          Governing Law: These terms and conditions shall be governed by and construed in accordance with the laws of
          Germany.
        </li>
      </ol>
    </EmptyPageTemplate>
  );
}
