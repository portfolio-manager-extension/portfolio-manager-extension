import React, { PropsWithChildren, useState } from "react";

type Props = PropsWithChildren & {
  text: string;
};
export default function OffcanvasBlock({ text, children }: Props) {
  const [expand, setExpand] = useState(true);

  return (
    <div className="offcanvas-block">
      <div className="offcanvas-block-header">
        <span className="offcanvas-block-title">{text}</span>
        <div className="offcanvas-block-options">
          {expand ? (
            <i className="fa fa-angle-up" onClick={() => setExpand(false)}></i>
          ) : (
            <i className="fa fa-angle-down" onClick={() => setExpand(true)}></i>
          )}
        </div>
      </div>
      <div className={"offcanvas-block-body" + (expand ? "" : " d-none")}>{children}</div>
    </div>
  );
}
