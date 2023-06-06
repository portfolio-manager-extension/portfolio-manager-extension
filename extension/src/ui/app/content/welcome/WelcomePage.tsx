import React from "react";
import { Link, useLoaderData } from "react-router-dom";
import EmptyPageTemplate from "../../components/lib/EmptyPageTemplate";
import { getMainNavItems } from "../getMainNavItems";
import LinkFactory from "../../../LinkFactory";

export default function WelcomePage() {
  const loaderData = useLoaderData() as App.ContentPageLoaderData;
  const links = LinkFactory.make(loaderData.locale, false);

  return (
    <EmptyPageTemplate
      mainNavItems={getMainNavItems(loaderData.locale, "welcome")}
      locale={loaderData.locale}
      settings={loaderData.settings}
      hasAccount={loaderData.hasAccount}
    >
      <div id="welcome-texts">
        <p>
          Welcome to the extension! To set up your account, please visit{" "}
          <a className="text-decoration-none" href="https://app.traderepublic.com">
            app.traderepublic.com
          </a>
          , log in, and follow the instructions provided by the small banner at the bottom of the page.
        </p>
        <p>In the meantime, feel free to explore the following useful information:</p>
        <ul>
          <li>
            <Link className="text-decoration-none" to={links.disclaimer}>
              Disclaimer
            </Link>
            : It is crucial to read and understand the disclaimer before using the extension.
          </li>
          <li>
            <Link className="text-decoration-none" to={links.howItWorks}>
              Learn how it works.
            </Link>
          </li>
          <li>
            <Link className="text-decoration-none" to={links.termsOfService}>
              Terms of service.
            </Link>
          </li>
          <li>
            <Link className="text-decoration-none" to={links.collectedData}>
              Read about the collected data and the reasons behind it.
            </Link>
          </li>
          <li>
            <Link className="text-decoration-none" to={links.changesLog}>
              Check out the Changes Log.
            </Link>
          </li>
        </ul>
        <div>
          <p>You can also view screenshots showcasing the extension in action:</p>
          <div className="text-center">
            <figure className="figure">
              <img src="./img/tr-trade-history.png" className="figure-img img-fluid rounded" />
              <figcaption className="figure-caption">Trade History show right when opening an instrument</figcaption>
            </figure>
            <br />
            <br />
            <figure className="figure">
              <img src="./img/new-tab-all-positions.png" className="figure-img img-fluid rounded" />
              <figcaption className="figure-caption">Tree chart to view all of your holding positions</figcaption>
            </figure>
            <br />
            <br />
            <figure className="figure">
              <img src="./img/new-tab-portfolio.png" className="figure-img img-fluid rounded" />
              <figcaption className="figure-caption">Custom portfolio provide better view of your position</figcaption>
            </figure>
            <br />
            <br />
            <figure className="figure">
              <img src="./img/new-tab-trading.png" className="figure-img img-fluid rounded" />
              <figcaption className="figure-caption">Trading activity and profit data</figcaption>
            </figure>
            <br />
            <br />
            <figure className="figure">
              <img src="./img/new-tab-dividend.png" className="figure-img img-fluid rounded" />
              <figcaption className="figure-caption">Dividend data</figcaption>
            </figure>
          </div>
        </div>
        <p>
          To build trust, we have made our source code open for inspection. However, please note that this is not free
          software. You can use it for free for up to 21 days, and there are no restrictions imposed. We rely on the
          kindness and support of our users to sustain and improve the extension.
        </p>
        <p>
          If you find this product valuable, you can also sponsor us or buy us a coffee. We appreciate your support.
          Thank you!
        </p>
      </div>
      <div id="credit-texts">
        <p>
          We would like to extend our sincere appreciation and recognition to the following open-source projects,
          including FontAwesome, for their invaluable contributions to our extension (alphabetical order):
        </p>
        <ul>
          <li>
            <a className="text-decoration-none" href="https://echarts.apache.org/en/index.html">
              Apache ECharts
            </a>
            : An Open Source JavaScript Visualization Library.
          </li>
          <li>
            <a className="text-decoration-none" href="https://github.com/blueimp/JavaScript-MD5">
              blueimp-md5
            </a>
            : JavaScript MD5 implementation.{" "}
          </li>
          <li>
            <a className="text-decoration-none" href=""></a>:
          </li>
          <li>
            <a className="text-decoration-none" href="https://fontawesome.com/">
              FontAwesome
            </a>
            : We gratefully acknowledge FontAwesome for providing the icon fonts that enhance the visual elements of our
            extension.
          </li>
          <li>
            <a className="text-decoration-none" href="https://jestjs.io/">
              jest
            </a>
            : Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
          </li>
          <li>
            <a className="text-decoration-none" href="http://stuartk.com/jszip">
              jszip
            </a>
            : A JavaScript class for generating and reading zip files.
          </li>
          <li>
            <a className="text-decoration-none" href="https://preactjs.com">
              Preact
            </a>
            : Fast 3kB alternative to React with the same modern API
          </li>
          <li>
            <a className="text-decoration-none" href="https://prettier.io/">
              prettier
            </a>
            : An opinionated code formatter.
          </li>
          <li>
            <a className="text-decoration-none" href="https://react.dev">
              React
            </a>
            : The library for web and native user interfaces.
          </li>
          <li>
            <a className="text-decoration-none" href="https://reactrouter.com/">
              React Router
            </a>
            : a client side routing.
          </li>
          <li>
            <a className="text-decoration-none" href="https://sinonjs.org/">
              sinon
            </a>
            : Standalone test spies, stubs and mocks for JavaScript.
          </li>
          <li>
            <a className="text-decoration-none" href="https://github.com/uuidjs/uuid/">
              uuid
            </a>
            : Generate RFC-compliant UUIDs in JavaScript.
          </li>
          <li>
            <a className="text-decoration-none" href="https://webpack.js.org">
              Webpack
            </a>
            : Bundle tool for javascript
          </li>
        </ul>
        <p>
          We are immensely grateful to the open-source community and the creators of FontAwesome for their dedication
          and efforts, which have played a significant role in the development of our extension.
        </p>
      </div>
    </EmptyPageTemplate>
  );
}
