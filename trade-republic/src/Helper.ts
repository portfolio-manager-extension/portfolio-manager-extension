export class Helper implements TradeRepublic.Helper {
  private makeXHRRequest(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            return resolve(JSON.parse(this.responseText));
          }
          reject(this.status);
        }
      };
      xhr.onerror = function (err) {
        reject(err);
      };
      // @ts-ignore
      xhr.crossDomain = true;
      xhr.withCredentials = true;
      xhr.open("GET", url, true);
      try {
        xhr.send();
      } catch (err) {
        reject(err);
      }
    });
  }

  fetchAccount(): Promise<TradeRepublic.Account> {
    return this.makeXHRRequest("https://api.traderepublic.com/api/v2/auth/account");
  }

  fetchTaxInformation(): Promise<any> {
    return this.makeXHRRequest("https://api.traderepublic.com/api/v1/auth/account/taxinformation");
  }

  readLocale(): Locale {
    const locale = document.documentElement.getAttribute("lang");
    if (!locale) {
      return "en";
    }
    return locale as Locale;
  }

  applySettings(settings: Extension.Settings): void {
    if (settings.censorSensitiveData) {
      document.body.classList.add("censored");
    } else {
      document.body.classList.remove("censored");
    }
  }

  findCurrency(jurisdiction: string): Currency {
    return "EUR";
  }
}
