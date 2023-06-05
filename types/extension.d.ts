declare type Locale = "en";
declare type Localized<T> = {
  default: T;
  en?: T;
  de?: T;
};
declare type LocalizedText = Localized<string>;
declare type Currency = "EUR" | "USD" | string;
declare type SortDirection = "asc" | "desc";
declare type Percentage = {
  value: number;
};

declare namespace Extension {
  type Settings = {
    version: string;
    censorSensitiveData: boolean;
    useFixedPageSize: boolean;
    locked: boolean;
    showTrialMessage: boolean;
    hideSponsors: boolean;
    hideSettingsDetails: boolean;
    hideExtensionDocuments: boolean;
    hideExtensionDocumentsDetails: boolean;
    hideAllExplanations: boolean;
  };

  type Account = {
    source: IAccountSource;
    locale: Locale;
    defaultCurrency: Currency;
    subscribed: boolean;
    age: number;
    createdAt: number;
  };

  interface IAccountSourceBase {
    type: string;
    id: string;
  }

  interface IAccountSource extends IAccountSourceBase {
    name: { first: string; last: string };
    email: string;
  }
}
