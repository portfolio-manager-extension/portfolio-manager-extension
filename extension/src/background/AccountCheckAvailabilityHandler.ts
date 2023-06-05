export class AccountCheckAvailabilityHandler implements Account.CheckAvailability.Handler {
  readonly type = "account:check-availability";
  private repository: Storage.ExtensionRepository;

  constructor(repository: Storage.ExtensionRepository) {
    this.repository = repository;
  }

  async execute(msg: Account.CheckAvailability.Message): Promise<Account.CheckAvailability.Result> {
    const result = await this.repository.findAccount(msg.payload.source);
    console.debug("AccountCheckAvailabilityHandler: result is", result);

    return result;
  }
}
