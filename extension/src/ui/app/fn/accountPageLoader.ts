import { ExtensionRepository } from "../../../storage/ExtensionRepository";
import { redirect } from "react-router-dom";
import UIEventDispatcher from "../../UIEventDispatcher";
import StorageFactory from "../../../storage/StorageFactory";

export async function accountPageLoader({ params }: any): Promise<any> {
  const extensionRepository = new ExtensionRepository();
  const account = await extensionRepository.findAccount({
    type: params.accountType,
    id: params.accountId,
  });
  const settings = await extensionRepository.getSettings();
  if (settings.locked || typeof account === "undefined") {
    return redirect("/");
  }
  UIEventDispatcher.registerTab("app", account);
  const portfolioRepository = StorageFactory.makePortfolioRepository(account);
  const portfolios = (await portfolioRepository.getAllActive()).sort(function (a, b) {
    if (a.order == b.order) {
      return a.name.localeCompare(b.name);
    }
    return a.order < b.order ? -1 : 1;
  });
  let currentPortfolio = undefined;
  if (typeof params.portfolioId !== "undefined") {
    currentPortfolio = portfolios.find(function (portfolio) {
      return portfolio.id == params.portfolioId;
    });
  }

  let selectedInstrumentId = undefined;
  if (typeof params.instrumentId !== "undefined") {
    selectedInstrumentId = params.instrumentId;
  }

  return { account, settings, portfolios, currentPortfolio, selectedInstrumentId };
}
