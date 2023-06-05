const translations: { en: TradeRepublic.Translations } = {
  en: {
    loginPageBanner: {
      pleaseLoginText: "Please login to start using the extension.",
    },
    appBanner: {
      btnText: "Open and view your data",
    },
    setUpBanner: {
      btnText: "Setup for this account",
    },
    privacy: {
      smallBannerText: "No worries, your data is always stored in your machine and never sent to anywhere.",
    },
    help: {
      howItWorkText: "Learn how it works",
      howItWorkLink: chrome.runtime.getURL("page/how-it-works.html"),
    },
  },
};

export class TranslationsFactory implements TradeRepublic.TranslationsFactory {
  make(locale: Locale): TradeRepublic.Translations {
    return translations[locale];
  }
}
