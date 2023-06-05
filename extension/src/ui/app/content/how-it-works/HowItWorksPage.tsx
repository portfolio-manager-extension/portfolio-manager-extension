import React from "react";
import { useLoaderData } from "react-router-dom";
import { getMainNavItems } from "../getMainNavItems";
import EmptyPageTemplate from "../../components/lib/EmptyPageTemplate";

export default function HowItWorksPage() {
  const loaderData = useLoaderData() as App.ContentPageLoaderData;

  return (
    <EmptyPageTemplate
      mainNavItems={getMainNavItems(loaderData.locale, "how-it-works")}
      locale={loaderData.locale}
      settings={loaderData.settings}
      hasAccount={loaderData.hasAccount}
    >
      <div id="how-it-works">
        <div className="text-center">
          <figure className="figure">
            <img src="./img/en.how-it-works.png" className="figure-img img-fluid rounded" />
            <figcaption className="figure-caption">
              The diagram illustrates the architecture of the extension, with all extension components depicted in blue.
              These components include the Banner, Reader, and App, which interact with the Trade Republic website and
              server to enable seamless data collection and visualization for portfolio management.
            </figcaption>
          </figure>
        </div>
        <br />
        The extension consists of three main components:
        <br />
        <br />
        <ol>
          <li>
            Banner: A small banner at the bottom of the Trade Republic app website that displays instructions and useful
            information. The Banner component does not store any credentials, and you need to log in to the Trade
            Republic website manually.
          </li>
          <li>
            Reader: A hidden code that listens to your interactions with Trade Republic. It captures the data you
            communicate with Trade Republic but does not store any credentials or personal data. The Reader component
            also requires you to log in to the Trade Republic website independently.
          </li>
          <li>
            App: The application that presents the data collected by the Reader. You can access the app whenever you
            open a new tab.
          </li>
        </ol>
        <p>
          Both the Banner and Reader components operate when you open and log in to your Trade Republic account. No data
          is stored during this process, and it is essential to note that they do not store any credentials. You have
          full control over your login process and need to provide the necessary credentials yourself.
        </p>
        <p>
          The Reader actively listens and captures the data you communicate with Trade Republic based on your browser
          behavior. For example, when you click on "Profile," the website calls Trade Republic servers to retrieve
          timeline data. When you click on a timeline for more details, the website fetches the corresponding timeline's
          detailed data. The Reader understands the data you send and receive, but it does not perform these actions on
          your behalf by default.
        </p>
        <p>
          It's important to note that we never send any trading action data to Trade Republic. The Reader mostly
          receives data silently. However, within the Banner component, there is a button labeled "Collect data
          automatically" that allows you to mimic your browser behavior and collect data faster without the need for
          manual clicks.
        </p>
        <p>
          All data is stored locally in a database called IndexedDB within your browser. The only information we collect
          is your Trade Republic ID, which helps us determine when you started using the extension.
        </p>
      </div>
    </EmptyPageTemplate>
  );
}
