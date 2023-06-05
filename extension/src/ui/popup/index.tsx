import React from "react";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import Popup from "./components/Popup";
import UIEventDispatcher from "../UIEventDispatcher";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <Popup locale={"en"} />
  </StrictMode>
);

UIEventDispatcher.registerTab("popup", undefined);

(function () {
  window.addEventListener("unload", function () {
    try {
      UIEventDispatcher.removeTab();
    } catch (error) {}
  });
})();
