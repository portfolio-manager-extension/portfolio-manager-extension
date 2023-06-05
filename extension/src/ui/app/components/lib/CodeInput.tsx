import React from "react";
import Form from "react-bootstrap/Form";

type Props = {
  textarea?: boolean;
  readonly?: boolean;
  selectOnFocus?: boolean;
  className?: string;
} & any;
export default function CodeInput({ readonly, textarea, className, selectOnFocus, ...rest }: Props) {
  const isReadOnly = typeof readonly === "undefined" ? true : readonly;
  const useTextarea = typeof textarea === "undefined" ? true : textarea;
  const classNames = typeof className === "undefined" ? "code-input" : className + " code-input";

  function onClick(e: any) {
    if (typeof selectOnFocus === "undefined" || selectOnFocus) {
      e.target.select();
    }
  }

  if (useTextarea) {
    return <Form.Control as="textarea" readOnly={isReadOnly} className={classNames} {...rest} onClick={onClick} />;
  }
  return <Form.Control readOnly={isReadOnly} className={classNames} {...rest} onClick={onClick} />;
}
