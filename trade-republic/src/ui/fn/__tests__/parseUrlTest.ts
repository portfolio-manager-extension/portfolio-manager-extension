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
    ];
    data.forEach(function (item) {
      const result = parseUrl(item.input);

      expect(result).toStrictEqual(item.output);
    });
  });
});
