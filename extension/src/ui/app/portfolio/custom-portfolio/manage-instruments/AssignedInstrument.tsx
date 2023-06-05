import React from "react";
import { useDrag, useDrop } from "react-dnd";

type Props = {
  item: App.Portfolio.AssignedInstrumentItem;
  prevItem: [string, number] | null;
  nextItem: [string, number] | null;
  onDeleteClick: (item: App.Portfolio.AssignedInstrumentItem) => void;
  moveInstrument: (id: string, to: number) => void;
  findInstrument: (id: string) => { index: number };
  onDnDEnd: () => void;
};

interface Item {
  id: string;
  originalIndex: number;
}

export default function AssignedInstrument({
  item,
  prevItem,
  nextItem,
  onDeleteClick,
  moveInstrument,
  findInstrument,
  onDnDEnd,
}: Props) {
  const originalIndex = findInstrument(item.id).index;
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "portfolio-item",
      item: { id: item.id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveInstrument(droppedId, originalIndex);
        } else {
          onDnDEnd();
        }
      },
    }),
    [item.id, originalIndex, moveInstrument]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "portfolio-item",
      hover({ id: draggedId }: Item) {
        if (draggedId !== item.id) {
          const { index: overIndex } = findInstrument(item.id);
          moveInstrument(draggedId, overIndex);
        }
      },
    }),
    [findInstrument, moveInstrument]
  );

  const opacity = isDragging ? 0.3 : 1;
  return (
    <li ref={(node) => drag(drop(node))} style={{ opacity }} className="list-group-item">
      <div className="assigned-instrument flex-grow-1 d-flex">
        <div className="icon">
          <img src={`https://assets.traderepublic.com/img/logos/${item.isin}/light.svg`} />
        </div>
        <div className="flex-grow-1">
          {item.name}
          {item.holding && <span className="holding text-success">holding {item.holdingSize}</span>}
        </div>
        <div className="actions">
          <i className="fa fa-x delete-btn" onClick={() => onDeleteClick(item)}></i>
        </div>
      </div>
    </li>
  );
}
