import React from "react";
import { useLoaderData } from "react-router-dom";
import { getMainNavItems } from "../getMainNavItems";
import EmptyPageTemplate from "../../components/lib/EmptyPageTemplate";

export default function DisclaimerPage() {
  const loaderData = useLoaderData() as App.ContentPageLoaderData;

  return (
    <EmptyPageTemplate
      mainNavItems={getMainNavItems(loaderData.locale, "disclaimer")}
      locale={loaderData.locale}
      settings={loaderData.settings}
      hasAccount={loaderData.hasAccount}
    >
      <div className="alert alert-warning">
        <p>
          <b>HAFTUNGSAUSSCHLUSS</b>: Die Portfolio Manager Extension dient ausschließlich zu Informationszwecken und
          stellt keine Finanzberatung dar. Die Extension ist dazu konzipiert, Ihnen bei der Verfolgung Ihres Portfolios
          zu helfen und auf Basis Ihrer eigenen Recherchen und Analysen informierte Anlageentscheidungen zu treffen.
        </p>

        <p>
          Bitte beachten Sie, dass die Portfolio Manager Extension keine Garantie für die Richtigkeit, Vollständigkeit,
          Aktualität, Zuverlässigkeit, Eignung oder Verfügbarkeit der bereitgestellten Informationen übernimmt. Die
          Extension kann Fehler, Auslassungen oder Ungenauigkeiten enthalten, und Sie sollten sich nicht ausschließlich
          auf die Informationen verlassen, die von der Extension bereitgestellt werden, um Ihre Anlageentscheidungen zu
          treffen.
        </p>

        <p>
          Die Investition in Finanzmärkte birgt Risiken, und Sie sollten Ihre Anlageziele, finanzielle Situation und
          Risikobereitschaft sorgfältig abwägen, bevor Sie Anlageentscheidungen treffen. Die Performance Ihres
          Portfolios kann schwanken, und vergangene Ergebnisse sind keine Garantie für zukünftige Ergebnisse.
        </p>

        <p>
          Durch die Verwendung der Portfolio Manager Extension erkennen Sie an und stimmen zu, dass die Extension nicht
          für Verluste oder Schäden, einschließlich direkter, indirekter, zufälliger, Folge- oder Strafschäden, haftet,
          die sich aus der Verwendung der Extension oder der bereitgestellten Informationen ergeben.
        </p>

        <p>
          Es liegt in Ihrer Verantwortung, Ihre eigenen Recherchen und Analysen durchzuführen und professionelle
          Finanzberatung einzuholen, bevor Sie Anlageentscheidungen treffen.
        </p>
      </div>

      <div className="alert alert-warning">
        <p>
          <b>DISCLAIMER</b>: The Portfolio Manager Extension is for informational purposes only and is not intended to
          provide financial advice. The extension is designed to help you track your portfolio and make informed
          investment decisions based on your own research and analysis.
        </p>

        <p>
          Please note that the Portfolio Manager Extension does not guarantee the accuracy, completeness, timeliness,
          reliability, suitability, or availability of the information provided. The extension may contain errors,
          omissions, or inaccuracies, and you should not rely on the information provided by the extension as the sole
          basis for your investment decisions.
        </p>

        <p>
          Investing in financial markets involves risks, and you should carefully consider your investment objectives,
          financial situation, and risk tolerance before making any investment decisions. The performance of your
          portfolio may fluctuate, and past performance is not indicative of future results.
        </p>

        <p>
          By using the Portfolio Manager Extension, you acknowledge and agree that the extension will not be held
          responsible for any losses or damages, including but not limited to direct, indirect, incidental,
          consequential, or punitive damages, arising from your use of the extension or any information provided by the
          extension.
        </p>

        <p>
          It is your responsibility to conduct your own research and analysis and seek professional financial advice
          before making any investment decisions.
        </p>
      </div>
    </EmptyPageTemplate>
  );
}
