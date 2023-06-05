export class RunForMainPageHandler implements TradeRepublic.RunForMainPage.Handler {
  readonly type: "trade-republic:run-for-main-page";
  cb?: (settings: Extension.Settings) => void;

  constructor() {
    this.type = "trade-republic:run-for-main-page";
    this.cb = undefined;
  }

  do(cb: (settings: Extension.Settings) => void) {
    this.cb = cb;
  }

  async execute(
    message: IMessage<"trade-republic:run-for-main-page", Extension.Settings>,
    sender: MessageSender
  ): Promise<undefined> {
    if (this.cb) {
      this.cb.call(undefined, message.payload);
    }
    return undefined;
  }
}
