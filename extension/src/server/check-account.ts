type GetAccountResponse = {
  data: {
    account_id: string;
    account_type: string;
    age_in_days: number;
    age_in_readable: string;
    is_active: boolean;
    is_subscribed: boolean;
  };
};
const BASE_URL = "https://portfolio-manager-extension.com";

async function getAccount(account: Extension.Account, timeout: number): Promise<Extension.Account | null> {
  const type = account.source.type == "trade-republic" ? "TR" : "-";
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  const getStream = await fetch(`${BASE_URL}/api/v1/account/me/${type}/${account.source.id}`, {
    signal: controller.signal,
  });
  const response: GetAccountResponse = await getStream.json();
  if (response.data.account_id == account.source.id) {
    return Object.assign({}, account, {
      subscribed: response.data.is_subscribed,
      age: Math.max(account.age, response.data.age_in_days),
    });
  }
  return null;
}

async function createAccount(account: Extension.Account, timeout: number): Promise<Extension.Account> {
  const type = account.source.type == "trade-republic" ? "TR" : "-";
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  const postStream = await fetch(`${BASE_URL}/api/v1/account/get-started`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: type, id: account.source.id }),
    mode: "no-cors",
  });
  await postStream;
  return account;
}

export async function checkAccount(account: Extension.Account, timeout: number): Promise<Extension.Account> {
  try {
    const current = await getAccount(account, timeout);
    if (current != null) {
      return current;
    }
    await createAccount(account, timeout);
  } catch (error) {}

  return account;
}
