import TradeRepublicMessageParser from "./TradeRepublicMessageParser";
import ProcessorUtilities from "./ProcessorUtilities";

const ICON_TO_TYPE_MAP: { [key: string]: ProcessedEntity.TimelineType } = {
  "https://assets.traderepublic.com/img/icon/timeline/Arrow-Left.png": "sell",
  "https://assets.traderepublic.com/img/icon/timeline/Arrow-Right.png": "buy",
  "https://assets.traderepublic.com/img/icon/timeline/Dividend.png": "dividend",
  "https://assets.traderepublic.com/img/icon/timeline/Vorabpauschale.png": "interest",
  "https://assets.traderepublic.com/img/icon/timeline/SavingsPlanExecuted.png": "saving-plan-execute",
  "https://assets.traderepublic.com/img/icon/timeline/CashIn.png": "deposit",
  "https://assets.traderepublic.com/img/icon/timeline/CashOut.png": "withdraw",
  "https://assets.traderepublic.com/img/icon/timeline/Change.png": "credit-shares",
  "https://assets.traderepublic.com/img/icon/timeline/ReferralFirstTradeExecuted.png": "award-money",
  "https://assets.traderepublic.com/img/icon/timeline/TaxPaymentBack.png": "tax-payment-back",

  "https://assets.traderepublic.com/img/icon/timeline/Plus.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/Cross.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/Document.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/human.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/ExemptionOrderChanged.png": "info",
  "https://assets.traderepublic.com/img/icon/timeline/ExemptionOrderChangeRequested.png": "info",

  "https://assets.traderepublic.com/img/icon/timeline/SavingsPlanChanged.png": "unused",
  "https://assets.traderepublic.com/img/icon/timeline/ExPostCostReport.png": "unused",
  "https://assets.traderepublic.com/img/icon/timeline/Jahressteuerbescheinigung.png": "unused",
  "https://assets.traderepublic.com/img/icon/timeline/SavingsPlanFailed.png": "unused",
};

export default class TradeRepublicTimelineEventsProcessor
  implements Processor.MessageProcessor<ProcessedEntity.Timeline[]>
{
  private storageFactory: Storage.StorageFactory;

  constructor(storageFactory: Storage.StorageFactory) {
    this.storageFactory = storageFactory;
  }

  match(message: RawEntity.Message, account: Extension.Account): boolean {
    return account.source.type == "trade-republic" && message.type == "timeline-events";
  }

  async store(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<ProcessedEntity.Timeline[]>,
    deduplicateResult: Processor.DeduplicateResult<ProcessedEntity.Timeline[]>,
    account: Extension.Account
  ): Promise<RawEntity.MessageStatus> {
    const repository = this.storageFactory.makeTimelineRepository(account);
    const merged = [];
    for (const input of processResult.data) {
      const exists = await repository.findById(input.id);
      if (exists) {
        merged.push({
          id: input.id,
          messageId: input.messageId,
          title: ProcessorUtilities.mergeLocalized(exists.title, input.title),
          body: ProcessorUtilities.mergeLocalized(exists.body, input.body),
          type: input.type,
          cashChangeAmount: input.cashChangeAmount,
          timestamp: input.timestamp,
          month: input.month,
          icon: input.icon,
          attributes: ProcessorUtilities.mergeOptionalLocalized(exists.attributes, input.attributes),
        });
      } else {
        merged.push(input);
      }
    }
    await this.storageFactory.makeTimelineRepository(account).saveBulk(merged);
    return processResult.warnings.length > 0 ? "processed-with-warning" : "processed";
  }

  async deduplicate(
    message: RawEntity.Message,
    processResult: Processor.ProcessResult<ProcessedEntity.Timeline[]>,
    account: Extension.Account
  ): Promise<Processor.DeduplicateResult<ProcessedEntity.Timeline[]>> {
    return { hasDuplicate: false };
  }

  async process(
    message: RawEntity.Message,
    account: Extension.Account
  ): Promise<Processor.ProcessResult<ProcessedEntity.Timeline[]>> {
    const input = TradeRepublicMessageParser.parseMessage<{ cursor: any; data: TradeRepublic.TimelineItem[] }>(
      message.received
    );
    if (!input) {
      return { data: [], processed: false, warnings: [] };
    }

    const results: ProcessedEntity.Timeline[] = [];
    input.data.forEach((item) => {
      if (item.type != "timelineEvent") {
        return;
      }
      results.push(this.processTimeline(item, message, account));
    });
    return { data: results, processed: true, warnings: [] };
  }

  processTimeline(
    item: TradeRepublic.TimelineEvent,
    message: RawEntity.Message,
    account: Extension.Account
  ): ProcessedEntity.Timeline {
    const locale = message.locale || account.locale;
    const title: LocalizedText = { default: item.data.title };
    title[locale] = item.data.title;

    const body: LocalizedText = { default: item.data.body };
    body[locale] = item.data.body;

    const attributes: Localized<any[]> = { default: item.data.attributes };
    attributes[locale] = item.data.attributes;

    const type = this.findTimelineType(item);
    return {
      id: item.data.id,
      messageId: message.id,
      title: title,
      body: body,
      type: type,
      cashChangeAmount: { value: item.data.cashChangeAmount || 0, currency: account.defaultCurrency },
      timestamp: item.data.timestamp,
      month: item.data.month,
      icon: item.data.icon,
      attributes: attributes,
    };
  }

  findTimelineType(item: TradeRepublic.TimelineEvent): ProcessedEntity.TimelineType {
    if (typeof ICON_TO_TYPE_MAP[item.data.icon] != "undefined") {
      return ICON_TO_TYPE_MAP[item.data.icon];
    }

    console.info("There is an unknown timeline event, please report this to improve the Extension", item);
    return "unknown";
  }
}
