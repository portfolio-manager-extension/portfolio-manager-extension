import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { pageEffect } from "../../fn/pageEffect";
import { getMainNavItems } from "../getMainNavItems";
import PageTemplate from "../../components/lib/PageTemplate";
import MainFunctionality from "../../components/lib/MainFunctionality";
import ExportExplanation from "./ExportExplanation";
import BackupManager from "../../../../backup/BackupManager";

function getFileName(): string {
  const instant = new Date();
  const result = [];
  result.push(instant.getFullYear());

  const month = instant.getMonth() + 1;
  result.push(month < 10 ? "0" + month : month.toString());

  const date = instant.getDate();
  result.push(date < 10 ? "0" + date : date.toString());

  result.push("-");

  const hours = instant.getHours();
  result.push(hours < 10 ? "0" + hours : hours.toString());

  const minutes = instant.getMinutes() + 1;
  result.push(minutes < 10 ? "0" + minutes : minutes.toString());

  const seconds = instant.getSeconds() + 1;
  result.push(seconds < 10 ? "0" + seconds : seconds.toString());

  return `pme-backup-${result.join("")}.zip`;
}

export default function ExportPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState({ value: false, fileName: "" });
  const [saveAs, setSaveAs] = useState(false);
  const [fileName, setFileName] = useState(getFileName());
  const [fileNameTick, setFileNameTick] = useState(getFileName());

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);
    const interval = setInterval(function () {
      setFileNameTick(getFileName());
    }, 1000);

    return () => {
      removeFn.call(undefined);
      clearInterval(interval);
    };
  }, []);

  async function runExport() {
    setExporting(true);
    const blob = await BackupManager.createExportBlob(loaderData.account, loaderData.settings);
    const url = URL.createObjectURL(blob);

    const exportedFileName = fileName || getFileName();
    chrome.downloads.download({
      filename: exportedFileName,
      url: url,
      saveAs: saveAs,
    });

    setFileName("");
    setExporting(false);
    setExported({ value: true, fileName: exportedFileName });
  }

  function onFormSubmit(e: any) {
    e.preventDefault();
    runExport();
  }

  const exportingComponent = (
    <p>
      <span>Collecting data to export</span>
      <i className="fa fa-spin fa-spinner" style={{ marginLeft: "1rem" }}></i>
    </p>
  );

  const formComponent = (
    <Form noValidate onSubmit={onFormSubmit}>
      <Form.Group className="mb-3" controlId="export-filename">
        <Form.Label>File name</Form.Label>
        <Form.Control placeholder={fileNameTick} onChange={(e) => setFileName(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="export-save-to-downloads">
        <Form.Check
          type="checkbox"
          label="save to default Downloads folder"
          checked={!saveAs}
          onChange={(e) => setSaveAs(!e.target.checked)}
        />
      </Form.Group>
      <Button type="submit" className="mb-2 btn btn-primary">
        Export Your Data
      </Button>
    </Form>
  );

  const exportedComponent = (
    <div className="alert alert-success">
      Your data is saved under the name <code>{exported.fileName}</code>. You can import into the extension anytime you
      want.
      <br />
      <br />
      <a
        className="text-decoration-none"
        href={""}
        onClick={(e) => {
          e.preventDefault();
          setExporting(false);
          setExported({ value: false, fileName: "" });
        }}
      >
        Run another export
      </a>
    </div>
  );

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, "export")}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="your-data"
    >
      {!settings.hideAllExplanations && <ExportExplanation />}
      <MainFunctionality loading={false} hasData={true} noDataComponent={<div />}>
        <Row>
          <Col xs={12} sm={{ span: 6, offset: 3 }}>
            {exported.value ? exportedComponent : exporting ? exportingComponent : formComponent}
          </Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
