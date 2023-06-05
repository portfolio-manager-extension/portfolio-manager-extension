import UIEventListener from "../../UIEventListener";

export function pageEffect(
  currentSettings: Extension.Settings,
  setSettings: (value: Extension.Settings) => any
): () => void {
  if (currentSettings.censorSensitiveData) {
    document.body.classList.add("censored");
  } else {
    document.body.classList.remove("censored");
  }
  document.body.classList.remove("lobby");
  document.title = "Portfolio Management Extension";

  return UIEventListener.onSettingsChangedListener((settings) => {
    setSettings(settings);
    if (settings.censorSensitiveData) {
      document.body.classList.add("censored");
    } else {
      document.body.classList.remove("censored");
    }

    if (settings.locked) {
      location.href = "#/";
    }
  });
}
