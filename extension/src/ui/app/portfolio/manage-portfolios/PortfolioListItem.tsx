import React from "react";
import { useDrag, useDrop } from "react-dnd";

type Props = {
  item: App.Portfolio.ManagePortfoliosItem;
  index: number;
  active: boolean;
  movePortfolioItem: (id: string, to: number) => void;
  findPortfolioItem: (id: string) => { index: number };
  onDnDEnd: () => void;
  onSelected: (item: App.Portfolio.ManagePortfoliosItem) => void;
};

interface Item {
  id: string;
  originalIndex: number;
}

export default function PortfolioListItem({
  item,
  movePortfolioItem,
  findPortfolioItem,
  onDnDEnd,
  active,
  onSelected,
}: Props) {
  const originalIndex = findPortfolioItem(item.id).index;
  const [{ isDragging }, drag, preview] = useDrag(
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
          movePortfolioItem(droppedId, originalIndex);
        } else {
          onDnDEnd();
        }
      },
    }),
    [item.id, originalIndex, movePortfolioItem]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "portfolio-item",
      hover({ id: draggedId }: Item) {
        if (draggedId !== item.id) {
          const { index: overIndex } = findPortfolioItem(item.id);
          movePortfolioItem(draggedId, overIndex);
        }
      },
    }),
    [findPortfolioItem, movePortfolioItem]
  );

  const opacity = isDragging ? 0.3 : 1;
  return (
    <li
      ref={(node) => preview(drop(node))}
      style={{ opacity }}
      className={"list-group-item portfolio" + (active ? " active" : "")}
      onClick={() => onSelected(item)}
    >
      <div className="d-flex flex-grow-1">
        <i ref={drag} className="fa fa-bars"></i>
        <div className="flex-grow-1">{item.name}</div>
        {item.isDefault &&
          (active ? (
            <span style={{ marginLeft: "0.5rem" }}>default</span>
          ) : (
            <span className="text-muted" style={{ marginLeft: "0.5rem" }}>
              default
            </span>
          ))}
      </div>
    </li>
  );
}
