import ServiceManager from "../service/ServiceManager";
import StorageFactory from "../storage/StorageFactory";

export class TradeRepublicGetTradeHistoryDataHandler implements TradeRepublic.GetTradeHistoryData.Handler {
  readonly type = "trade-republic:get-trade-history-data";

  async execute(
    message: TradeRepublic.GetTradeHistoryData.Message,
    sender: MessageSender
  ): Promise<TradeRepublic.GetTradeHistoryData.Response> {
    const service = await ServiceManager.getTransactionService(message.payload.account);
    const realtimeTickerRepository = StorageFactory.makeRealtimeTickerRepository(message.payload.account);
    const snapshot = realtimeTickerRepository.findRealtimeAndConvertToSnapshot(message.payload.instrumentId);
    const result = service.getTradeHistoryDataByISIN(message.payload.instrumentId, snapshot);

    if (result.transactions.length == 0) {
      return null;
    }
    return result;
  }
}
