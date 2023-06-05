const ACCOUNT_REQUEST_TIMEOUT = 1500;

export class TradeRepublicTab {
  readonly id: number;
  private running: boolean;
  private mainPageExecuted: boolean;
  private read: boolean;
  private buffering: boolean;
  private account: Extension.Account | undefined;
  private messages: TradeRepublic.FilteredMessage[];
  private accountRequestTimeout: any;
  private consumer: Background.TradeRepublicMessageConsumer;

  constructor(tabId: number, consumer: Background.TradeRepublicMessageConsumer) {
    this.id = tabId;
    this.running = false;
    this.mainPageExecuted = false;
    this.read = false;
    this.buffering = false;
    this.messages = [];
    this.consumer = consumer;
  }

  pageStart(accountRequestTimeoutCallback: (tab: TradeRepublicTab) => void): this {
    console.info("TradeRepublicTab: page started");
    this.accountRequestTimeout = setTimeout(() => {
      if (!this.running) {
        return;
      }

      console.debug("TradeRepublicTab: account request timeout, trigger callback", this.id);
      accountRequestTimeoutCallback.call(undefined, this);
    }, ACCOUNT_REQUEST_TIMEOUT);
    this.running = true;
    this.mainPageExecuted = false;
    this.buffering = false;
    return this;
  }

  pageStop() {
    console.info("TradeRepublicTab: page stopped, reset state");
    this.running = false;
    this.mainPageExecuted = false;
    this.read = false;
    this.buffering = false;
    this.messages = [];
  }

  isMainPageExecuted(): boolean {
    return this.mainPageExecuted;
  }

  markMainPageExecuted(): this {
    this.mainPageExecuted = true;
    return this;
  }

  enableMessageBuffer(): this {
    console.info("TradeRepublicTab: enable message buffer, clear all messages");
    this.read = false;
    this.buffering = true;
    this.messages = [];

    return this;
  }

  pushMessage(message: TradeRepublic.FilteredMessage) {
    if (!this.buffering && this.account !== undefined) {
      this.consumer.consume(message, this.account);
    } else {
      console.debug("TradeRepublicTab: cannot consume message now, push to buffer", message);
      this.messages.push(message);
    }
  }

  consumeMessages(account: Extension.Account) {
    this.account = Object.assign({}, account);
    this.buffering = false;
    this.messages.forEach((item) => {
      this.consumer.consume(item, account);
    });
    this.messages = [];
  }

  clearAccountRequestTimeout() {
    console.info("TradeRepublicTab: clear accountRequestTimeout");
    clearTimeout(this.accountRequestTimeout);
    this.accountRequestTimeout = undefined;
  }
}
