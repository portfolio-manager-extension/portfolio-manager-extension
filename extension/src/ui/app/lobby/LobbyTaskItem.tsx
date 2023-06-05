import React from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";

type Props = {
  task: UtilityEntity.Task;
  onDelete: (task: UtilityEntity.Task, forever: boolean) => void;
  onEdit: (task: UtilityEntity.Task) => void;
  onRestore: (task: UtilityEntity.Task) => void;
  onDone: (task: UtilityEntity.Task) => void;
  onUndone: (task: UtilityEntity.Task) => void;
};
export default function LobbyTaskItem({ task, onDelete, onEdit, onRestore, onDone, onUndone }: Props) {
  if (task.status === "deleted") {
    return (
      <li className="list-group-item">
        <div className="task">
          <div className="task-text text-decoration-line-through task-deleted">{task.text}</div>
          <div className="task-action">
            <ButtonGroup size="sm">
              <Button variant="primary" onClick={() => onRestore(task)}>
                <i className="fa fa-recycle"></i>
              </Button>
              <Button variant="danger" onClick={() => onDelete(task, true)}>
                delete forever
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </li>
    );
  }

  if (task.status === "done") {
    return (
      <li className="list-group-item">
        <div className="task">
          <div className="task-text text-decoration-line-through text-muted" onDoubleClick={() => onUndone(task)}>
            {task.text}
          </div>
          <div className="task-action">
            <ButtonGroup size="sm">
              <Button variant="danger" onClick={() => onDelete(task, false)}>
                <i className="fa fa-x"></i>
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="list-group-item">
      <div className="task">
        <div className="task-text" onDoubleClick={() => onDone(task)}>
          {task.text}
        </div>
        <div className="task-action">
          <ButtonGroup size="sm">
            <Button variant="primary" onClick={() => onEdit(task)}>
              <i className="fa fa-edit"></i>
            </Button>
            <Button variant="danger" onClick={() => onDelete(task, false)}>
              <i className="fa fa-x"></i>
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </li>
  );
}
