const SUB_REGEX = /^(sub)\s([0-9]+)\s*(.*)$/;
const UNSUB_REGEX = /^(unsub)\s([0-9]+)$/;
const RESPONSE_REGEX = /^([0-9]+)\sA\s(.*)$/;

export default class WebsocketMessageParser implements TradeRepublic.WebsocketMessageParser {
  parseSubMessage(input: string): TradeRepublic.WebsocketSubMessageResult {
    if (!SUB_REGEX.test(input)) {
      return { valid: false, messageId: "", data: undefined };
    }
    const matches = input.match(SUB_REGEX);
    if (!matches) {
      return { valid: false, messageId: "", data: undefined };
    }
    return { valid: true, messageId: matches[2], data: this.parseJSON(matches[3]) };
  }

  parseUnsubMessage(input: string): TradeRepublic.WebsocketUnsubMessageResult {
    if (!UNSUB_REGEX.test(input)) {
      return { valid: false, messageId: "" };
    }
    const matches = input.match(UNSUB_REGEX);
    if (!matches) {
      return { valid: false, messageId: "" };
    }
    return { valid: true, messageId: matches[2] };
  }

  parseResponseMessage(input: string): TradeRepublic.WebsocketResponseMessageResult {
    if (!RESPONSE_REGEX.test(input)) {
      return { valid: false, messageId: "", data: undefined };
    }
    const matches = input.match(RESPONSE_REGEX);
    if (!matches) {
      return { valid: false, messageId: "", data: undefined };
    }
    return { valid: true, messageId: matches[1], data: this.parseJSON(matches[2]) };
  }

  private parseJSON(input: any): any {
    if (typeof input != "string") {
      return undefined;
    }
    if (input.trim() == "") {
      return undefined;
    }
    try {
      return JSON.parse(input);
    } catch (error) {
      return undefined;
    }
  }
}
