import TradeRepublicTimelineAccountBalanceProcessor from "../TradeRepublicTimelineAccountBalanceProcessor";
import { StorageUtil } from "../../storage/StorageUtil";

function makeAccount(): Extension.Account {
  return {
    source: {
      id: "test",
      type: "test",
      name: { first: "test", last: "test" },
      email: "test@test.com",
    },
    locale: "en",
    defaultCurrency: "EUR",
    subscribed: true,
    age: 0,
    createdAt: 0,
  };
}

function makeMessage(input: TradeRepublic.TimelineAccountBalance, locale: string): RawEntity.Message {
  const timestamp = Date.now();
  return {
    id: "message-id",
    received: JSON.stringify({ data: [input] }),
    sent: "",
    locale: locale as any,
    type: "timeline-events",
    status: "unprocessed",
    month: StorageUtil.getMonth(timestamp),
    date: StorageUtil.getDate(timestamp),
    timestamp: timestamp,
    signature: "",
  };
}

describe("TradeRepublicTimelineAccountBalanceProcessorTest", function () {
  it("should match the Portfolio Value and Cash Account in english", async function () {
    const instance = new TradeRepublicTimelineAccountBalanceProcessor({} as any);
    const input: TradeRepublic.TimelineAccountBalance = {
      type: "timelineAccountBalance",
      data: {
        id: "anything",
        timestamp: 1680307199000,
        title: "Report Q1/2023",
        items: [
          { title: "Portfolio Value", detail: 123456 },
          { title: "Cash Account", detail: 123 },
        ],
        totalChange: { title: "Performance", absolute: 1000, relative: 0.1 },
      },
    };

    const result = await instance.process(makeMessage(input, "en"), makeAccount());

    expect(result.data[0].portfolioValue.value).toBe(123456);
    expect(result.data[0].cashAccount.value).toBe(123);
    expect(result.warnings.length).toBe(0);
  });

  it("should match the Portfolio Value and Cash Account in german", async function () {
    const instance = new TradeRepublicTimelineAccountBalanceProcessor({} as any);
    const input: TradeRepublic.TimelineAccountBalance = {
      type: "timelineAccountBalance",
      data: {
        id: "anything",
        timestamp: 1680307199000,
        title: "Report Q1/2023",
        items: [
          { title: "Portfoliowert", detail: 123456 },
          { title: "Verrechnungskonto", detail: 123 },
        ],
        totalChange: { title: "Performance", absolute: 1000, relative: 0.1 },
      },
    };

    const result = await instance.process(makeMessage(input, "de"), makeAccount());

    expect(result.data[0].portfolioValue.value).toBe(123456);
    expect(result.data[0].cashAccount.value).toBe(123);
    expect(result.warnings.length).toBe(0);
  });

  it("should match the Portfolio Value and Cash Account by position with warning", async function () {
    const instance = new TradeRepublicTimelineAccountBalanceProcessor({} as any);
    const input: TradeRepublic.TimelineAccountBalance = {
      type: "timelineAccountBalance",
      data: {
        id: "anything",
        timestamp: 1680307199000,
        title: "Report Q1/2023",
        items: [
          { title: "whatever", detail: 123456 },
          { title: "whatever", detail: 123 },
        ],
        totalChange: { title: "Performance", absolute: 1000, relative: 0.1 },
      },
    };

    const result = await instance.process(makeMessage(input, "wf"), makeAccount());

    expect(result.data[0].portfolioValue.value).toBe(123456);
    expect(result.data[0].cashAccount.value).toBe(123);
    expect(result.warnings.length).toBe(2);
    expect(result.warnings[0]).toStrictEqual({
      dataId: "anything",
      input: [
        {
          detail: 123456,
          title: "whatever",
        },
        {
          detail: 123,
          title: "whatever",
        },
      ],
      message: "Portfolio Value is not matched by exact text.",
      messageId: "message-id",
      output: {
        value: 123456,
      },
      reason: "language-not-supported-yet",
    });
    expect(result.warnings[1]).toStrictEqual({
      dataId: "anything",
      input: [
        {
          detail: 123456,
          title: "whatever",
        },
        {
          detail: 123,
          title: "whatever",
        },
      ],
      message: "Cash Account is not matched by exact text.",
      messageId: "message-id",
      output: {
        value: 123,
      },
      reason: "language-not-supported-yet",
    });
  });
});
