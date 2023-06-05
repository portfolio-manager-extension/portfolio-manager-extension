import injectWebSocket from "./inject-web-socket";

injectWebSocket({
  injected: function () {
    console.info("Portfolio Manager Extension is injected, ready to read and store data only in your machine.");
  },

  didSend: function (data, url) {
    const messageSent = new CustomEvent("trade-republic-ws-message-sent", {
      detail: { data: data, url: url },
    });
    document.dispatchEvent(messageSent);
  },

  didReceive: function (data, url) {
    const messageReceived = new CustomEvent("trade-republic-ws-message-received", {
      detail: { data: data, url: url },
    });
    document.dispatchEvent(messageReceived);
  },
});

// Will do in next version, not now
// type GetVueData<T> = {
//   selector: string;
//   path: string;
//   defaultValue: T;
//   multiple: boolean;
// };
//
// type GetVueDataResponse<T> = {
//   selector: string;
//   index: number;
//   result: T;
//   path: string;
//   multiple: boolean;
// };
//
// document.addEventListener("pme-get-vue-data", function (event) {
//   const detail = (event as CustomEvent<GetVueData<any>>).detail;
//   const el = document.querySelector(detail.selector);
//   if (el) {
//     // const result = get(el["__vue__"], detail.path, detail.defaultValue);
//     // @ts-ignore
//     console.log(el.__vue__)
//     const response = new CustomEvent<GetVueDataResponse<any>>("pme-get-vue-data-response", {
//       detail: {
//         result: "test",
//         selector: detail.selector,
//         path: detail.path,
//         index: -1,
//         multiple: false,
//       },
//     });
//     document.dispatchEvent(response);
//   }
// });
