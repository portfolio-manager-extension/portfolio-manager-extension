import React, { useEffect, useRef, useState } from "react";
import PageTemplate from "../../components/lib/PageTemplate";
import { getMainNavItems } from "../getMainNavItems";
import MainFunctionality from "../../components/lib/MainFunctionality";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import { useLoaderData } from "react-router-dom";
import { pageEffect } from "../../fn/pageEffect";
import ImportExplanation from "./ImportExplanation";
import BackupManager from "../../../../backup/BackupManager";
import ImportFiles from "./ImportFiles";

export default function ImportPage() {
  const loaderData = useLoaderData() as App.AccountPageLoaderData;

  const fileRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<Extension.Settings>(loaderData.settings);
  const [fileErrorMessage, setFileErrorMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importingFiles, setImportingFiles] = useState<Backup.FileImportState[]>([]);
  const [imported, setImported] = useState(false);
  const [reprocessRawMessages, setReprocessRawMessages] = useState(true);
  const [countTexts, setCountTexts] = useState<Backup.CountText[]>([]);

  useEffect(() => {
    const removeFn = pageEffect(loaderData.settings, setSettings);

    return () => {
      removeFn.call(undefined);
    };
  }, []);

  function onFormSubmit(e: any) {
    e.preventDefault();
    setReady(false);
    if (fileRef.current && fileRef.current.files && fileRef.current.files.length > 0) {
      const file = fileRef.current.files[0];
      BackupManager.importBackup(
        loaderData.account,
        {
          reprocessRawMessages: reprocessRawMessages,
        },
        file,
        function (state, files) {
          if (state == "start") {
            setImporting(true);
            setImported(false);
          } else if (state == "done") {
            setImporting(false);
            setImported(true);
          }
          setImportingFiles(files);
        }
      );
    }
  }

  async function onFileChanged(this: any, e: any) {
    setFileErrorMessage(``);
    setReady(false);
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const result = await BackupManager.parseBackup(loaderData.account, selectedFile);
      if (result.isValid) {
        if (!result.hasData) {
          setFileErrorMessage("There is no data in your backup file.");
        } else {
          setReady(true);
          setCountTexts(result.countTexts);
        }
      } else {
        setFileErrorMessage(result.errorMessage);
      }
    }
  }

  const importingComponent = (
    <div>
      <p>
        <span>Importing data to the extension...</span>
      </p>
      <ImportFiles files={importingFiles} />
    </div>
  );

  const importPreview = (
    <div className="alert alert-secondary">
      Data ready to be imported:
      <ul className="mb-0 mt-3">
        {countTexts.map(function (item, index) {
          return (
            <li key={index}>
              {item.text}{" "}
              {item.safe ? (
                <span className="text text-success">Safe</span>
              ) : (
                <span className="text text-danger">
                  Warning: your current data will be overwritten, please export your data before running import
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
  const formComponent = (
    <Form noValidate onSubmit={onFormSubmit}>
      {ready && importPreview}
      <Form.Group className="mb-3 invalid" controlId="export-filename">
        <Form.Control
          ref={fileRef}
          type="file"
          accept={BackupManager.getBackupFileMimeType()}
          onChange={onFileChanged}
          isInvalid={fileErrorMessage != ""}
        />
        <Form.Control.Feedback type="invalid">{fileErrorMessage}</Form.Control.Feedback>
      </Form.Group>
      {ready && (
        <Form.Group className="mb-3" controlId="export-save-to-downloads">
          <Form.Check
            type="checkbox"
            label="reprocess all raw messages"
            checked={reprocessRawMessages}
            onChange={(e) => setReprocessRawMessages(e.target.checked)}
          />
        </Form.Group>
      )}
      <Button disabled={!ready} type="submit" className={"mb-2 btn" + (ready ? " btn-primary" : " btn-secondary")}>
        Import your data
      </Button>
    </Form>
  );

  const importedComponent = (
    <div>
      <div className="alert alert-success">
        Your data is imported to the extension.
        <br />
        <br />
        <a
          className="text-decoration-none"
          href={""}
          onClick={(e) => {
            e.preventDefault();
            setImporting(false);
            setImported(false);
          }}
        >
          Run another import
        </a>
      </div>
      <ImportFiles files={importingFiles} />
    </div>
  );

  return (
    <PageTemplate
      mainNavItems={getMainNavItems(loaderData.account, "import")}
      account={loaderData.account}
      settings={settings}
      portfolios={loaderData.portfolios}
      selectedMenu="your-data"
    >
      {!settings.hideAllExplanations && <ImportExplanation account={loaderData.account} />}
      <MainFunctionality loading={false} hasData={true} noDataComponent={<div />}>
        <Row>
          <Col xs={12} sm={{ span: 6, offset: 3 }}>
            {imported ? importedComponent : importing ? importingComponent : formComponent}
          </Col>
        </Row>
      </MainFunctionality>
    </PageTemplate>
  );
}
