const translations: { en: UI.PopupTranslation } = {
  en: {
    noAccount: {
      infoText: "Please login to your Trade Republic Account to start using the extension",
      openTradeRepublicApp: "Open app.traderepublic.com",
      learnHowItWork: "Learn how it works",
      disclaimer: "Haftungsausschluss / Disclaimer",
      collectedData: "Collected data and reasons",
      viewSourceCode: "View source code in github",
      buyMeACoffee: "Buy me a coffee",
    },
    hasAccounts: {
      viewDataBtn: "View Your Data",
      openTradeRepublic: "Open Trade Republic",
    },
  },
};

export default class PopupTranslationFactory implements UI.PopupTranslationFactory {
  make(locale: Locale): UI.PopupTranslation {
    return translations[locale];
  }
}
