import { parseUrl } from "../parseUrl";

describe("parseUrl", function () {
  it("should work with any domain", function () {
    const data = [
      {
        input: "https://app.tr.de/instrument/US02079K3059",
        output: { page: "instrument", instrumentId: "US02079K3059" },
      },
      {
        input: "https://app.tr.com/instrument/US02079K3059?timeline=whatever",
        output: { page: "instrument", instrumentId: "US02079K3059" },
      },
      {
        input: "https://app.traderepublic.com/login?redirectFrom=%2Finstrument%2FUS02079K3059",
        output: { page: "login" },
      },
      {
        input: "https://app.traderepublic.com/?whatever",
        output: { page: "home" },
      },
      {
        input: "https://app.traderepublic.com/portfolio?timeframe=1d",
        output: { page: "instrument", instrumentId: "" },
      },
      {
        input: "https://app.traderepublic.com/orders/savings-plan",
        output: { page: "instrument", instrumentId: "" },
      },
      {
        input: "https://app.traderepublic.com/profile",
        output: { page: "instrument", instrumentId: "" },
      },
      {
        input: "https://app.traderepublic.com/settings/personal",
        output: { page: "instrument", instrumentId: "" },
      },
      {
        input: "https://traderepublic.com/en-de",
        output: { page: "unknown" },
      },
      {
        input: "https://app.traderepublic.com/download-app",
        output: { page: "unknown" },
      },
    ];
    data.forEach(function (item) {
      const result = parseUrl(item.input);
      expect(result).toStrictEqual(item.output);
    });
  });
});
