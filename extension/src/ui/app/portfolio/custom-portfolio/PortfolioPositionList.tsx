import React from "react";
import PortfolioPositionItem from "./PortfolioPositionItem";

type Props = {
  positions: App.Portfolio.PortfolioPositionItem[];
  selectedInstrumentId: string | undefined;
};

export default function PortfolioPositionList({ positions, selectedInstrumentId }: Props) {
  return (
    <div id="portfolio-positions">
      {positions.map(function (position, index) {
        return (
          <PortfolioPositionItem
            key={index}
            data={position}
            selected={position.instrument.id == selectedInstrumentId}
          />
        );
      })}
    </div>
  );
}
