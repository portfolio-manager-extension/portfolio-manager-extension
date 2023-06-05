import StorageFactory from "../storage/StorageFactory";
import TransactionService from "./transaction/TransactionService";
import TransactionInputData from "./transaction/TransactionInputData";
import InstrumentService from "./instrument/InstrumentService";

class serviceManager implements Service.ServiceManager {
  async getTransactionService(account: Extension.Account): Promise<Service.TransactionService> {
    const instrumentService = await this.getInstrumentService(account);
    const service = new TransactionService(
      instrumentService,
      new TransactionInputData(StorageFactory, instrumentService)
    );
    await service.initialize(account);

    return service;
  }

  async getInstrumentService(account: Extension.Account): Promise<Service.InstrumentService> {
    const repository = StorageFactory.makeInstrumentRepository(account);

    return this.makeInstrumentService(await repository.getAll());
  }

  makeInstrumentService(instruments: RawEntity.Instrument[]): Service.InstrumentService {
    return new InstrumentService(instruments);
  }

  makeTransactionService(instrumentService: Service.InstrumentService): Service.TransactionService {
    return new TransactionService(instrumentService, new TransactionInputData(StorageFactory, instrumentService));
  }
}

const ServiceManager = new serviceManager();
export default ServiceManager;
