import TradeRepublicMessageParser from "./TradeRepublicMessageParser";
import Monetary = Entity.Monetary;
import ProcessResult = Processor.ProcessResult;

const PORTFOLIO_VALUE_TEXTS = {
  en: "Portfolio Value",
  de: "Portfoliowert",
};

const CASH_ACCOUNT_TEXTS = {
  en: "Cash Account",
  de: "Verrechnungskonto",
};

export default class TradeRepublicTimelineAccountBalanceProcessor
  implements Processor.MessageProcessor<ProcessedEntity.QuarterlyBalance[]>
{
  private storageFactory: Storage.StorageFactory;
  warnings: Processor.ProcessWarning[] = [];

  constructor(storageFactory: Storage.StorageFactory) {
    this.storageFactory = storageFactory;
  }

  match(message: RawEntity.Message, account: Extension.Account): boolean {
    return account.source.type == "trade-republic" && message.type == "timeline-events";
  }

  async store(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<ProcessedEntity.QuarterlyBalance[]>,
    deduplicateResult: Processor.DeduplicateResult<ProcessedEntity.QuarterlyBalance[]>,
    account: Extension.Account
  ): Promise<RawEntity.MessageStatus> {
    await this.storageFactory.makeQuarterlyBalanceRepository(account).saveBulk(processResult.data);

    return processResult.warnings.length > 0 ? "processed-with-warning" : "processed";
  }

  async deduplicate(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<ProcessedEntity.QuarterlyBalance[]>,
    account: Extension.Account
  ): Promise<Processor.DeduplicateResult<ProcessedEntity.QuarterlyBalance[]>> {
    return { hasDuplicate: false };
  }

  async process(
    message: RawEntity.Message,
    account: Extension.Account
  ): Promise<Processor.ProcessResult<ProcessedEntity.QuarterlyBalance[]>> {
    const input = TradeRepublicMessageParser.parseMessage<{ cursor: any; data: TradeRepublic.TimelineItem[] }>(
      message.received
    );
    if (!input) {
      return { data: [], processed: false, warnings: [] };
    }

    this.warnings = [];
    const results: ProcessedEntity.QuarterlyBalance[] = [];
    input.data.forEach((item) => {
      if (item.type != "timelineAccountBalance") {
        return;
      }
      results.push(this.processQuarterlyBalance(item, message, account));
    });
    return { data: results, processed: true, warnings: this.warnings };
  }

  processQuarterlyBalance(
    item: TradeRepublic.TimelineAccountBalance,
    message: RawEntity.Message,
    account: Extension.Account
  ): ProcessedEntity.QuarterlyBalance {
    const locale = message.locale || account.locale;
    const title: LocalizedText = { default: item.data.title };
    title[locale] = item.data.title;

    return {
      id: item.data.id,
      messageId: message.id,
      portfolioValue: this.findItem(
        item,
        message,
        account.defaultCurrency,
        PORTFOLIO_VALUE_TEXTS,
        0,
        "Portfolio Value is not matched by exact text.",
        "Cannot find portfolioValue in TimelineAccountBalance"
      ),
      cashAccount: this.findItem(
        item,
        message,
        account.defaultCurrency,
        CASH_ACCOUNT_TEXTS,
        1,
        "Cash Account is not matched by exact text.",
        "Cannot find cashAccount in TimelineAccountBalance"
      ),
      title: title,
      absolutePerformance: item.data.totalChange.absolute,
      relativePerformance: item.data.totalChange.relative,
      timestamp: item.data.timestamp,
    };
  }

  findItem(
    timelineAccountBalance: TradeRepublic.TimelineAccountBalance,
    message: RawEntity.Message,
    currency: Currency,
    texts: any,
    index: number,
    warningText: string,
    logInfoText: string
  ): Entity.Monetary {
    const result = timelineAccountBalance.data.items.find((item) => {
      return item.title == texts[message.locale];
    });
    if (result) {
      return { value: result.detail, currency: currency };
    }

    if (timelineAccountBalance.data.items.length > index) {
      const value = timelineAccountBalance.data.items[index].detail;
      this.warnings.push({
        messageId: message.id,
        dataId: timelineAccountBalance.data.id,
        input: timelineAccountBalance.data.items,
        output: { value: value },
        reason: "language-not-supported-yet",
        message: warningText,
      });
      return { value: value, currency: currency };
    }

    console.info(logInfoText, timelineAccountBalance);
    return { value: 0, currency: currency };
  }
}
