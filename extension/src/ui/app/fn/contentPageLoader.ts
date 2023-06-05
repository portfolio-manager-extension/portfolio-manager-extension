import { ExtensionRepository } from "../../../storage/ExtensionRepository";
import UIEventDispatcher from "../../UIEventDispatcher";

export async function contentPageLoader({ params }: any): Promise<any> {
  const extensionRepository = new ExtensionRepository();
  const accounts = await extensionRepository.getAccounts();
  const settings = await extensionRepository.getSettings();
  UIEventDispatcher.removeTab();
  document.body.classList.remove("lobby");
  document.title = "Portfolio Management Extension";

  return { locale: params.locale || "en", hasAccount: accounts.length > 0, settings };
}
