import React, { useEffect, useState } from "react";
import NoAccount from "./NoAccount";
import Accounts from "./Accounts";
import { ExtensionRepository } from "../../../storage/ExtensionRepository";
import UIEventListener from "../../UIEventListener";

type Props = {
  locale: Locale;
};

export default function Popup({ locale }: Props) {
  const [accounts, setAccounts] = useState<Extension.Account[]>([]);
  const extensionRepository = new ExtensionRepository();

  const onAccountsChanged = async function () {
    const data = await extensionRepository.getAccounts();
    setAccounts(data);
  };

  useEffect(() => {
    (async () => await onAccountsChanged())();

    const removeFn = UIEventListener.onAccountsChangedListener(function (accounts) {
      setAccounts(accounts);
    });

    return () => {
      removeFn.call(undefined);
    };
  }, []);

  if (accounts.length == 0) {
    return <NoAccount locale={locale}></NoAccount>;
  }

  return <Accounts locale={locale} accounts={accounts}></Accounts>;
}
