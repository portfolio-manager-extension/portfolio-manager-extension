import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

type Props = {
  portfolios: CustomEntity.Portfolio[];
  currentPortfolio: CustomEntity.Portfolio;
  onSwap: (left: CustomEntity.Portfolio, right: CustomEntity.Portfolio) => void;
  onSetAsDefault: (currentDefault: CustomEntity.Portfolio | undefined, portfolio: CustomEntity.Portfolio) => void;
  onDelete: (portfolio: CustomEntity.Portfolio) => void;
};

export default function QuickActions({ portfolios, currentPortfolio, onSwap, onSetAsDefault, onDelete }: Props) {
  const canSetAsDefault = !currentPortfolio.isDefault;
  const position = portfolios.findIndex(function (item) {
    return item.id == currentPortfolio.id;
  });
  const canMoveLeft = position - 1 > -1;
  const canMoveRight = position + 1 < portfolios.length;

  function triggerOnSwap(adjust: number) {
    const left = position;
    const right = position + adjust;
    if (left >= 0 && left < portfolios.length && right >= 0 && right < portfolios.length) {
      onSwap.call(undefined, portfolios[left], portfolios[right]);
    }
  }

  function triggerOnSetAsDefault() {
    const currentDefault = portfolios.find((item) => item.isDefault);
    onSetAsDefault.call(undefined, currentDefault, currentPortfolio);
  }

  function triggerOnDelete() {
    onDelete.call(undefined, currentPortfolio);
  }

  return (
    <>
      <Dropdown
        id="portfolio-quick-actions"
        className="hide-caret float-end"
        align="end"
        style={{ marginLeft: "1rem" }}
      >
        <DropdownButton align="end" title={<i className="fa fa-ellipsis"></i>} variant="primary">
          {canMoveLeft ? (
            <Dropdown.Item onClick={() => triggerOnSwap(-1)}>Move to left</Dropdown.Item>
          ) : (
            <Dropdown.Item className="text-muted">Move to left</Dropdown.Item>
          )}
          {canMoveRight ? (
            <Dropdown.Item onClick={() => triggerOnSwap(1)}>Move to right</Dropdown.Item>
          ) : (
            <Dropdown.Item className="text-muted">Move to right</Dropdown.Item>
          )}

          <Dropdown.Divider />
          {canSetAsDefault ? (
            <Dropdown.Item onClick={() => triggerOnSetAsDefault()}>Set as default tab</Dropdown.Item>
          ) : (
            <Dropdown.Item className="text-muted">Set as default tab</Dropdown.Item>
          )}

          <Dropdown.Divider />
          <Dropdown.Item className="text-danger" onClick={() => triggerOnDelete()}>
            Delete
          </Dropdown.Item>
        </DropdownButton>
      </Dropdown>
    </>
  );
}
