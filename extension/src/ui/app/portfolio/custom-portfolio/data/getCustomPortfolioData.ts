import StorageFactory from "../../../../../storage/StorageFactory";
import CustomPortfolioDataDirector from "./CustomPortfolioDataDirector";
import CustomPortfolioDataBuilder from "./CustomPortfolioDataBuilder";

export async function getCustomPortfolioData(
  account: Extension.Account,
  options: App.Portfolio.CustomPortfolioOptions
): Promise<App.Portfolio.CustomPortfolioData> {
  const director = new CustomPortfolioDataDirector(
    StorageFactory.makePositionRepository(account),
    StorageFactory.makeInstrumentRepository(account),
    StorageFactory.makeTickerSnapshotRepository(account),
    StorageFactory.makePortfolioInstrumentRepository(account),
    new CustomPortfolioDataBuilder()
  );

  return director.make(account, options);
}

export function getEmptyCustomPortfolioData(): App.Portfolio.CustomPortfolioData {
  return {
    overview: {
      allocation: {
        amount: { value: 0, text: "", currency: "" },
        percentage: { value: 0, text: "" },
        holdingTotal: {
          value: 0,
          text: "",
          currency: "",
        },
        count: { position: 0, buy: 0, sell: 0 },
      },
      valuation: {
        valuation: { value: 0, text: "", currency: "" },
        absolute: { value: 0, text: "", currency: "" },
        percentage: { value: 0, text: "" },
        updatedAt: "",
      },
      realized: {
        dividend: { value: 0, text: "", currency: "" },
        dividendCount: 0,
        fee: { value: 0, text: "", currency: "" },
        profit: { value: 0, text: "", currency: "" },
        tax: { value: 0, text: "", currency: "" },
        total: { value: 0, text: "", currency: "" },
      },
    },
    positions: [],
  };
}
