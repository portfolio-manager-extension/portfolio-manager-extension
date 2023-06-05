declare namespace CustomEntity {
  interface Interest extends Entity.IInterest {}

  interface Portfolio extends Entity.ITimestamp {
    id: string;
    name: string;
    isDefault: boolean;
    order: number;
    status: "active" | "deleted";
  }

  interface PortfolioInstrument extends Entity.ITimestamp {
    id: string;
    portfolioId: string;
    instrumentId: string;
    target: PortfolioInstrumentTarget;
    order: number;
  }

  type PortfolioInstrumentTarget = {
    weight?: number;
    price?: number;
  };
}
