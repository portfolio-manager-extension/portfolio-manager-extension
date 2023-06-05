export class BackgroundCommunicator implements TradeRepublic.BackgroundCommunicator {
  readonly sender: TradeRepublic.MessageSender;

  constructor(sender: TradeRepublic.MessageSender) {
    this.sender = sender;
  }

  checkAvailability(account: Extension.IAccountSource, locale: Locale): Promise<Account.CheckAvailability.Result> {
    return this.sender.send({
      type: "account:check-availability",
      payload: {
        source: account,
        locale: locale,
      },
    });
  }

  sendStartConsumeMessagesSignal(account: Extension.Account): void {
    this.sender.send({ type: "trade-republic:start-consume-messages", payload: account });
  }

  sendPageStartSignal(): void {
    this.sender.send({ type: "trade-republic:page-start", payload: undefined });
  }

  sendPageStopSignal(): void {
    this.sender.send({ type: "trade-republic:page-stop", payload: undefined });
  }

  setupAccount(account: Extension.IAccountSource, locale: Locale, currency: Currency): Promise<Account.Setup.Result> {
    return this.sender.send({
      type: "account:setup",
      payload: {
        source: account,
        locale: locale,
        currency: currency,
      },
    });
  }

  sendFilteredMessage(filteredMessage: TradeRepublic.FilteredMessage): void {
    // TODO: comment next line to temporary disable for developing
    this.sender.send({ type: "trade-republic:capture-message", payload: filteredMessage });
  }

  openLinkInNewTab(url: string): void {
    this.sender.send({ type: "tab:open-link-in-new-tab", payload: { url: url } });
  }

  openApp(account: Extension.Account | undefined): void {
    this.sender.send({ type: "tab:open-app", payload: { account: account } });
  }

  getTradeHistoryData(
    account: Extension.Account,
    instrumentId: string
  ): Promise<TradeRepublic.GetTradeHistoryData.Response> {
    return this.sender.send({
      type: "trade-republic:get-trade-history-data",
      payload: { account: account, instrumentId: instrumentId },
    });
  }
}
