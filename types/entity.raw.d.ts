declare namespace RawEntity {
  type MessageStatus = "unprocessed" | "processed" | "processed-with-warning" | "duplicated";
  type Message = {
    id: string;
    received: string;
    sent: string;
    locale: Locale;
    type: string;
    month: string;
    date: string;
    signature: string;
    status: MessageStatus;
    timestamp: number;
  };

  type InstrumentSplit = {
    id: string;
    initial: number;
    final: number;
    date: number;
  };

  // instrument contains basic data which use to translate ISIN into name, it created by a lot of message whenever
  // customer refresh the page, then we mark these messages as duplicated and delete, then this entity should be raw
  // and exportable
  type Instrument = {
    id: string;
    name: string;
    shortName: string;
    type: Entity.InstrumentType;
    country: string | null;
    splits: InstrumentSplit[];
  };

  // this data is a snapshot whenever we have RealtimeTicker, not for building a candle stick but to avoid storing all
  // RealtimeTicker therefore it should be in raw message and exportable
  type TickerSnapshot = {
    id: string; // uuid()
    type: "history" | "latest"; // this for querying, ticker always have only one latest
    instrument: string; // this for querying, instrument = instrumentId + "." + exchangeId
    instrumentId: string;
    exchangeId: string;
    value: string;
    date: string;
    month: string;
    timestamp: number;
  };
}
