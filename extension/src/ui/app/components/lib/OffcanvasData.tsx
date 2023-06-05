import React from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

type Props = {
  onSelect?: (key: "processed" | "custom") => void;
  tab?: "processed" | "custom";
  customData: React.ReactNode;
  processedData: React.ReactNode;
};

type TitleProps = {
  id: string;
  text: string;
  icon: string;
  tooltip: string;
};

function OffcanvasDataTitle({ id, text, icon, tooltip }: TitleProps) {
  id = "offcanvas-data-title-" + id;
  return (
    <>
      <OverlayTrigger placement="top" overlay={<Tooltip id={id}>{tooltip}</Tooltip>}>
        <i className={icon}></i>
      </OverlayTrigger>
      {text}
    </>
  );
}

export default function OffcanvasData({ tab, customData, processedData, onSelect }: Props) {
  const processedDataTitle = (
    <OffcanvasDataTitle
      id="processed"
      text="Processed Data"
      icon="fa fa-gears"
      tooltip="This is data we collected when you open Trade Republic, this data cannot be edited."
    />
  );
  // const customDataTitle = (
  //   <OffcanvasDataTitle
  //     id="custom"
  //     text="Custom Data"
  //     icon="fa fa-pen-to-square"
  //     tooltip="This is your input data, it overrides Processed Data. You use it for correction or customize your way."
  //   />
  // );

  let defaultActiveKey = tab || "processed";

  function onTabSelect(key: any) {
    if (typeof onSelect !== "undefined") {
      onSelect(key);
    }
  }

  return (
    <Tabs defaultActiveKey={defaultActiveKey} fill mountOnEnter={true} onSelect={onTabSelect}>
      <Tab eventKey="processed" title={processedDataTitle}>
        {processedData}
      </Tab>
      {/*<Tab eventKey="custom" title={customDataTitle}>*/}
      {/*  {customData}*/}
      {/*</Tab>*/}
    </Tabs>
  );
}
