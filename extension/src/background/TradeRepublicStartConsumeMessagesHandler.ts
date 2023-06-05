export class TradeRepublicStartConsumeMessagesHandler implements TradeRepublic.StartConsumeMessages.Handler {
  readonly type = "trade-republic:start-consume-messages";
  readonly manager: Background.TradeRepublicManager;

  constructor(manager: Background.TradeRepublicManager) {
    this.manager = manager;
  }

  async execute(message: TradeRepublic.StartConsumeMessages.Message, sender: MessageSender): Promise<undefined> {
    this.manager.onStartConsumeMessages(sender.tab!.id!, message.payload);

    return undefined;
  }
}
