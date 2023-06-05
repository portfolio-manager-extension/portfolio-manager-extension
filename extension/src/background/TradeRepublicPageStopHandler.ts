export class TradeRepublicPageStopHandler implements TradeRepublic.PageStop.Handler {
  readonly type = "trade-republic:page-stop";
  readonly manager: Background.TradeRepublicManager;

  constructor(manager: Background.TradeRepublicManager) {
    this.manager = manager;
  }

  async execute(message: IMessage<"trade-republic:page-stop", undefined>, sender: MessageSender): Promise<undefined> {
    this.manager.onPageStop(sender.tab!.id!);

    return undefined;
  }
}
