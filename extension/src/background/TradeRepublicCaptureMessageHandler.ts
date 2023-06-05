export class TradeRepublicCaptureMessageHandler implements TradeRepublic.CaptureMessage.Handler {
  readonly type = "trade-republic:capture-message";
  readonly manager: Background.TradeRepublicManager;

  constructor(manager: Background.TradeRepublicManager) {
    this.manager = manager;
  }

  async execute(message: TradeRepublic.CaptureMessage.Message, sender: MessageSender): Promise<undefined> {
    this.manager.onReceiveFilteredMessage(sender.tab!.id!, message.payload);

    return undefined;
  }
}
