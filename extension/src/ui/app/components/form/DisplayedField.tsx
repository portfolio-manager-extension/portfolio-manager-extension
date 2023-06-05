import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { getLabelSmallCol } from "./functions";

type Props = {
  text: string;
  value?: string;
  layout?: UI.InlineLayout;
  total?: boolean;
};

export default function DisplayField(props: Props) {
  const labelSM = getLabelSmallCol(props.layout);
  let value: any = "";
  if (typeof props.value === "undefined") {
    value = <div className="form-control-plaintext no-data">No Data</div>;
  } else {
    value = <div className="form-control-plaintext">{props.value}</div>;
  }

  return (
    <Form.Group
      as={Row}
      className={"mb-1" + (typeof props.total != "undefined" && props.total ? " total-form-group" : "")}
    >
      <Form.Label column sm={labelSM}>
        {props.text}
      </Form.Label>
      <Col sm={12 - labelSM}>{value}</Col>
    </Form.Group>
  );
}
