import React from "react";
import Form from "react-bootstrap/Form";
import CodeInput from "../../components/lib/CodeInput";
import OffcanvasBlockDelete from "../../components/lib/OffcanvasBlockDelete";
import StorageFactory from "../../../../storage/StorageFactory";

type Props = {
  account: Extension.Account;
  item: RawEntity.Message;
  onDeleted?: (item: RawEntity.Message) => void;
};
export default function RawMessageForm({ account, item, onDeleted }: Props) {
  async function onDeleteRequest() {
    const repository = StorageFactory.makeMessageRepository(account);
    await repository.deleteById(item.id);
    if (typeof onDeleted !== "undefined") {
      onDeleted.call(undefined, item);
    }
  }

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <Form.Group className="mb-2" controlId="raw-message-type">
        <Form.Label>Type</Form.Label>
        <Form.Control type="text" value={item.type} disabled />
      </Form.Group>
      <Form.Group className="mb-2" controlId="raw-message-content">
        <Form.Label>Content</Form.Label>
        <CodeInput rows={10} value={item.received} />
      </Form.Group>
      <OffcanvasBlockDelete show={true} onDeleteRequest={onDeleteRequest} />
    </Form>
  );
}
