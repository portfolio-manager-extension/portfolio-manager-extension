export class AccountSetupHandler implements Account.Setup.Handler {
  readonly type = "account:setup";
  private repository: Storage.ExtensionRepository;

  constructor(repository: Storage.ExtensionRepository) {
    this.repository = repository;
  }

  async execute(message: IMessage<"account:setup", Account.Setup.Payload>): Promise<Account.Setup.Result> {
    const result = await this.repository.createAccount(
      message.payload.locale,
      message.payload.currency,
      message.payload.source
    );
    console.debug("AccountSetupHandler: result is", result);

    return result;
  }
}
