import React, { useState } from "react";

type Props = {
  show: boolean;
  onDeleteRequest: () => void;
  linkText?: string;
  confirmationText?: string;
  yesText?: string;
  noText?: string;
};

type Texts = {
  linkText: string;
  confirmationText: string;
  yesText: string;
  noText: string;
};

const DEFAULT_TEXTS: Texts = {
  linkText: "Delete",
  confirmationText: "Are you sure?",
  yesText: "Yes",
  noText: "No",
};

export default function OffcanvasBlockDelete({ show, onDeleteRequest, ...inputTexts }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!show) {
    return <></>;
  }

  const texts = Object.assign({}, DEFAULT_TEXTS, inputTexts);
  if (confirming) {
    return (
      <div className="offcanvas-block-delete">
        <span>{texts.confirmationText}</span>
        <button
          className="btn btn-danger btn-sm"
          onClick={(e) => {
            e.preventDefault();
            onDeleteRequest.call(undefined);
          }}
        >
          {texts.yesText}
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={(e) => {
            e.preventDefault();
            setConfirming(false);
          }}
        >
          {texts.noText}
        </button>
      </div>
    );
  }

  return (
    <div className="offcanvas-block-delete">
      <a
        className="text text-danger text-decoration-none"
        onClick={(e) => {
          e.preventDefault();
          setConfirming(true);
        }}
      >
        {texts.linkText}
      </a>
    </div>
  );
}
