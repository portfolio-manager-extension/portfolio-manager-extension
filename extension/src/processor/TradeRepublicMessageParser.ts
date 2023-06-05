const TradeRepublicMessageParser = {
  parseMessage<T extends any>(input: string): T | null {
    try {
      return JSON.parse(input);
    } catch (e: any) {
      return null;
    }
  },
};
export default TradeRepublicMessageParser;
