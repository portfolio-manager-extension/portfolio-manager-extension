import TradeRepublicMessageParser from "./TradeRepublicMessageParser";

export default class TradeRepublicRealtimeTickerInstantaneousProcessor
  implements Processor.MessageInstantaneousProcessor
{
  private storageFactory: Storage.StorageFactory;

  constructor(storageFactory: Storage.StorageFactory) {
    this.storageFactory = storageFactory;
  }

  match(message: Processor.InstantaneousMessage, account: Extension.Account): boolean {
    return account.source.type == "trade-republic" && message.type == "realtime-ticker";
  }

  process(message: Processor.InstantaneousMessage, account: Extension.Account): void {
    const received = TradeRepublicMessageParser.parseMessage<TradeRepublic.TickerResponse>(message.received);
    const sent = TradeRepublicMessageParser.parseMessage<TradeRepublic.TickerRequest>(message.sent);
    if (received == null || sent == null) {
      return;
    }

    const realtimeTicker: ProcessedEntity.RealtimeTicker = {
      id: sent.id,
      open: received.open,
      pre: received.pre,
      last: received.last,
      ask: received.ask,
      bid: received.bid,
      delta: received.delta,
      leverage: received.leverage,
    };
    this.storageFactory.makeRealtimeTickerRepository(account).put(realtimeTicker);
  }
}
