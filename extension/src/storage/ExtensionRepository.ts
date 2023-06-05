import { checkAccount } from "../server/check-account";

const DEFAULT_LOCALE: Locale = "en";
const DEFAULT_CURRENCY: Currency = "EUR";

export const DEFAULT_EXTENSION_SETTINGS: Extension.Settings = {
  version: "...",
  censorSensitiveData: false,
  useFixedPageSize: false,
  locked: false,
  showTrialMessage: true,
  hideSponsors: false,
  hideSettingsDetails: false,
  hideExtensionDocuments: false,
  hideExtensionDocumentsDetails: false,
  hideAllExplanations: false,
};

const ACCOUNT_STORAGE_KEY = "pme-accounts";
const EXTENSION_SETTINGS_KEY = "pme-settings";

type StoredAccount = {
  type: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  locale: Locale;
  isSubscribed: boolean;
  defaultCurrency: Currency;
  createdAt: number;
};

type StoredAccounts = {
  accounts?: Array<StoredAccount>;
};

export class ExtensionRepository implements Storage.ExtensionRepository {
  async getSettings(): Promise<Extension.Settings> {
    const raw = await chrome.storage.sync.get(EXTENSION_SETTINGS_KEY);
    if (typeof raw[EXTENSION_SETTINGS_KEY] === "undefined") {
      return Object.assign({}, DEFAULT_EXTENSION_SETTINGS, {
        version: chrome.runtime.getManifest().version,
      });
    }
    return Object.assign({}, DEFAULT_EXTENSION_SETTINGS, raw[EXTENSION_SETTINGS_KEY], {
      version: chrome.runtime.getManifest().version,
    });
  }

  async saveSettings(settings: Extension.Settings): Promise<boolean> {
    await chrome.storage.sync.set({
      [EXTENSION_SETTINGS_KEY]: settings,
    });
    return true;
  }

  async createAccount(
    locale: Locale,
    currency: Currency,
    source: Extension.IAccountSource
  ): Promise<Extension.Account> {
    const account = await this.findAccount(source);
    if (typeof account === "undefined") {
      const returned = { source, locale, defaultCurrency: currency, age: 0, subscribed: false, createdAt: 0 };
      await this.saveAccounts([returned]);
      return returned;
    }
    return account;
  }

  async findAccount(source: Extension.IAccountSourceBase): Promise<Extension.Account | undefined> {
    const accounts = await this.getAccounts();

    const account = accounts.find((item) => item.source.type == source.type && item.source.id == source.id);
    if (account) {
      return checkAccount(account, 500);
    }
    return undefined;
  }

  async getAccounts(): Promise<Extension.Account[]> {
    const raw: { [ACCOUNT_STORAGE_KEY]: StoredAccounts } = (await chrome.storage.sync.get(ACCOUNT_STORAGE_KEY)) as any;
    if (typeof raw[ACCOUNT_STORAGE_KEY] === "undefined") {
      return [];
    }
    if (typeof raw[ACCOUNT_STORAGE_KEY].accounts == "undefined") {
      return [];
    }
    return raw[ACCOUNT_STORAGE_KEY].accounts.map((item) => this.mapStoredAccountToExtensionAccount(item));
  }

  async saveAccounts(accounts: Extension.Account[]): Promise<boolean> {
    await chrome.storage.sync.set({
      [ACCOUNT_STORAGE_KEY]: {
        accounts: accounts.map((item) =>
          this.mapISourceAccountToStoredAccount(item.source, item.locale, item.defaultCurrency)
        ),
      },
    });
    return true;
  }

  mapStoredAccountToExtensionAccount(input: StoredAccount, locale?: Locale): Extension.Account {
    return {
      source: {
        type: input.type as any,
        id: input.id,
        name: { first: input.firstName, last: input.lastName },
        email: input.email,
      },
      locale: locale || input.locale || DEFAULT_LOCALE,
      subscribed: input.isSubscribed,
      defaultCurrency: input.defaultCurrency || DEFAULT_CURRENCY,
      age: this.calculateAge(input.createdAt),
      createdAt: input.createdAt,
    };
  }

  mapISourceAccountToStoredAccount(input: Extension.IAccountSource, locale: Locale, currency: Currency): StoredAccount {
    return {
      type: input.type,
      id: input.id,
      firstName: input.name.first,
      lastName: input.name.last,
      email: input.email,
      locale: locale,
      isSubscribed: false,
      defaultCurrency: currency,
      createdAt: Date.now(),
    };
  }

  calculateAge(timestamp: number): number {
    return Math.floor((Date.now() - timestamp) / 86400000);
  }
}
