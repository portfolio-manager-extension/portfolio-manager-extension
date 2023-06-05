declare namespace Processor {
  type WarningReason = "language-not-supported-yet" | "unknown-data";

  type ProcessWarning = {
    messageId: string;
    dataId: string;
    reason: WarningReason;
    message: string;
    input: any;
    output: any;
  };

  type ProcessResult<T> = {
    data: T;
    processed: boolean;
    warnings: ProcessWarning[];
  };

  type DeduplicateResult<T> = {
    hasDuplicate: boolean;
    dataInDB?: T;
    metadata?: any;
  };

  type InstantaneousMessage = {
    locale: string;
    type: string;
    received: string;
    sent: string;
  };

  interface Manager {
    processInstantaneously(message: Processor.InstantaneousMessage, account: Extension.Account): boolean;
    process(entity: RawEntity.Message, account: Extension.Account): Promise<RawEntity.MessageStatus>;
    reprocess(messageId: string, account: Extension.Account): Promise<RawEntity.MessageStatus>;
  }

  interface MessageProcessor<T> {
    match(message: RawEntity.Message, account: Extension.Account): boolean;
    process(message: RawEntity.Message, account: Extension.Account): Promise<ProcessResult<T>>;
    deduplicate(
      message: RawEntity.Message,
      processResult: ProcessResult<T>,
      account: Extension.Account
    ): Promise<DeduplicateResult<T>>;
    store(
      message: RawEntity.Message,
      processResult: ProcessResult<T>,
      deduplicateResult: DeduplicateResult<T>,
      account: Extension.Account
    ): Promise<RawEntity.MessageStatus>;
  }

  interface MessageInstantaneousProcessor {
    match(message: InstantaneousMessage, account: Extension.Account): boolean;
    process(message: InstantaneousMessage, account: Extension.Account): void;
  }
}
