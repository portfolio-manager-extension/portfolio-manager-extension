import React from "react";

type Props = {
  item: App.Portfolio.AvailableInstrumentItem;
  onAvailableItemClick: (item: App.Portfolio.AvailableInstrumentItem) => void;
};

export default function AvailableInstrument({ item, onAvailableItemClick }: Props) {
  return (
    <li className="list-group-item" onClick={() => onAvailableItemClick(item)}>
      <div className="available-instrument flex-grow-1 d-flex">
        <div className="icon">
          <img src={`https://assets.traderepublic.com/img/logos/${item.isin}/light.svg`} />
        </div>
        <div className="flex-grow-1">
          {item.name}
          {item.holding && <span className="holding text-success">holding {item.holdingSize}</span>}
        </div>
        <div className="assigned-portfolio">
          {item.portfolioNames.length > 0 && "Assigned to: " + item.portfolioNames.join(", ")}
        </div>
      </div>
    </li>
  );
}
