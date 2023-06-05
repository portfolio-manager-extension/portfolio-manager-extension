export class TradeRepublicPageStartHandler implements TradeRepublic.PageStart.Handler {
  readonly type = "trade-republic:page-start";
  readonly manager: Background.TradeRepublicManager;

  constructor(manager: Background.TradeRepublicManager) {
    this.manager = manager;
  }

  async execute(message: IMessage<"trade-republic:page-start", undefined>, sender: MessageSender): Promise<undefined> {
    this.manager.onPageStart(sender.tab!.id!);

    return undefined;
  }
}
