import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import { getLabelSmallCol } from "./functions";

type Props = {
  id: string;
  text: string;
  name: string;
  value?: string;
  defaultValue?: string;
  lock?: boolean;
  layout?: UI.InlineLayout;
  required?: true;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  symbol?: "eur" | "percent" | "unit";
};

export const NumberField = forwardRef(function (props: Props, ref) {
  const formControlRef = useRef<HTMLElement>(null);
  const [lock, setLock] = useState(typeof props.lock !== "undefined" ? props.lock : false);

  const [value, setValue] = useState<string>(props.defaultValue || "");
  useEffect(() => {
    setValue(props.defaultValue || "");
  }, [props.defaultValue]);
  useImperativeHandle(ref, imperative);

  function parseValue(): number {
    if (value == "") {
      return NaN;
    }
    return typeof props.integer != "undefined" && props.integer ? parseInt(value) : parseFloat(value);
  }

  function validate(): boolean {
    const val = parseValue();
    const isRequired = typeof props.required == "undefined" ? false : props.required;
    if (isNaN(val) && isRequired) {
      return false;
    }
    if (typeof props.min != "undefined" && val < props.min) {
      return false;
    }
    if (typeof props.max != "undefined" && val > props.max) {
      return false;
    }
    return true;
  }

  function imperative(): UI.FieldRef<number> {
    return {
      validate(): boolean {
        return validate();
      },
      getName(): string {
        return props.name;
      },
      getValue(): number {
        return parseValue();
      },
      getNameValue(): object {
        return { [this.getName()]: this.getValue() };
      },
    };
  }

  const formControlProps: any = {};
  if (typeof props.required != "undefined") {
    formControlProps["required"] = props.required;
  }
  if (typeof props.min != "undefined") {
    formControlProps["min"] = props.min;
  }
  if (typeof props.max != "undefined") {
    formControlProps["max"] = props.max;
  }
  if (typeof props.step != "undefined") {
    formControlProps["step"] = props.step;
  }

  const labelSM = getLabelSmallCol(props.layout);

  let symbol = (
    <InputGroup.Text>
      <i className="fa-solid fa-euro-sign"></i>
    </InputGroup.Text>
  );
  if (typeof props.symbol !== "undefined") {
    if (props.symbol == "percent") {
      symbol = (
        <InputGroup.Text>
          <i className="fa-solid fa-percent"></i>
        </InputGroup.Text>
      );
    } else if (props.symbol == "unit") {
      symbol = (
        <InputGroup.Text>
          <i className="fa-solid fa-cubes"></i>
        </InputGroup.Text>
      );
    }
  }

  let lockIcon = null;
  if (typeof props.lock !== "undefined" && props.lock) {
    lockIcon = (
      <InputGroup.Text
        className="lockable"
        onClick={() => {
          setLock(!lock);
          if (!lock) {
            formControlRef.current!.focus();
          }
        }}
      >
        <i className={"fa-solid " + (lock ? "fa-lock" : "fa-unlock")}></i>
      </InputGroup.Text>
    );
    formControlProps.disabled = lock;
  }

  return (
    <Form.Group as={Row} className="mb-1" controlId={props.id}>
      <Form.Label column sm={labelSM}>
        {props.text}
      </Form.Label>
      <Col sm={12 - labelSM}>
        <InputGroup className="mb-1">
          {lockIcon}
          <Form.Control
            ref={formControlRef}
            type="number"
            {...formControlProps}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {symbol}
        </InputGroup>
      </Col>
    </Form.Group>
  );
});
export default NumberField;
