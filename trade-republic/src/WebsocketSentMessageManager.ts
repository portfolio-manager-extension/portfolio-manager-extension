export default class WebsocketSentMessageManager {
  private subMap: Map<string, any>;
  private unsubSet: Set<string>;

  constructor() {
    this.subMap = new Map();
    this.unsubSet = new Set();
  }

  sub(messageId: string, data: any) {
    this.subMap.set(messageId, data);
  }

  unsub(messageId: string) {
    this.unsubSet.add(messageId);
  }

  get(messageId: string): any {
    const data = this.subMap.get(messageId);
    if (this.unsubSet.has(messageId)) {
      this.subMap.delete(messageId);
      this.unsubSet.delete(messageId);
    }
    return data;
  }
}
