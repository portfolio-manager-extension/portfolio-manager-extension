import WebsocketMessageParser from "../WebsocketMessageParser";

describe("WebsocketMessageParserTest", function () {
  const sut = new WebsocketMessageParser();

  describe("parseSubMessage()", function () {
    it("should return valid false if the message is not matched", function () {
      const dataset = ["", "anything", "123 A test", "unsub 123", "sub", "sub test", "sub test test"];
      for (const input of dataset) {
        const result = sut.parseSubMessage(input);

        expect(result.valid).toBe(false);
        expect(result.messageId).toBe("");
        expect(result.data).toBeUndefined();
      }
    });

    it("should return valid true if the message is matched", function () {
      const dataset = [
        { input: "sub 1", expectedMessageId: "1", expectedData: undefined },
        { input: "sub 123", expectedMessageId: "123", expectedData: undefined },
        { input: `sub 123 {"a": 456}`, expectedMessageId: "123", expectedData: { a: 456 } },
      ];
      for (const item of dataset) {
        const result = sut.parseSubMessage(item.input);

        expect(result.valid).toBe(true);
        expect(result.messageId).toBe(item.expectedMessageId);
        expect(result.data).toStrictEqual(item.expectedData);
      }
    });
  });

  describe("parseUnsubMessage()", function () {
    it("should return valid false if the message is not matched", function () {
      const dataset = ["", "anything", "123 A test", "sub", "sub test", "unsub", "unsub abc", "UNSUB 123"];
      for (const input of dataset) {
        const result = sut.parseUnsubMessage(input);

        expect(result.valid).toBe(false);
        expect(result.messageId).toBe("");
      }
    });

    it("should return valid true if the message is matched", function () {
      const dataset = [
        { input: "unsub 1", expectedMessageId: "1" },
        { input: "unsub 123", expectedMessageId: "123" },
      ];
      for (const item of dataset) {
        const result = sut.parseUnsubMessage(item.input);

        expect(result.valid).toBe(true);
        expect(result.messageId).toBe(item.expectedMessageId);
      }
    });
  });

  describe("parseResponseMessage()", function () {
    it("should return valid false if the message is not matched", function () {
      const dataset = ["", "anything", "123 A", "unsub 123", "sub", "sub test", "sub test test", "1 B test"];
      for (const input of dataset) {
        const result = sut.parseResponseMessage(input);

        expect(result.valid).toBe(false);
        expect(result.messageId).toBe("");
        expect(result.data).toBeUndefined();
      }
    });

    it("should return valid true if the message is matched", function () {
      const dataset = [
        { input: "1 A {}", expectedMessageId: "1", expectedData: {} },
        { input: "123 A {}", expectedMessageId: "123", expectedData: {} },
        { input: `123 A {"a": 456}`, expectedMessageId: "123", expectedData: { a: 456 } },
      ];
      for (const item of dataset) {
        const result = sut.parseResponseMessage(item.input);

        expect(result.valid).toBe(true);
        expect(result.messageId).toBe(item.expectedMessageId);
        expect(result.data).toStrictEqual(item.expectedData);
      }
    });
  });
});
