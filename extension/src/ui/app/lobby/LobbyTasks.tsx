import React, { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import LobbyTaskItem from "./LobbyTaskItem";
import UtilityRepository from "../../../storage/UtilityRepository";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

// We name the to-do list as Task to avoid IDE understands it as a to-do
export default function LobbyTasks() {
  const nameRef = useRef(null);
  const [currentTaskValue, setCurrentTaskValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [tasks, setTasks] = useState<UtilityEntity.Task[]>([]);
  const [editingTask, setEditingTask] = useState<UtilityEntity.Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadCount, setLoadCount] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    (async function () {
      const repository = new UtilityRepository();
      const statuses: UtilityEntity.TaskStatus[] = ["in-progress"];
      if (showDone) {
        statuses.push("done");
      }
      if (showDeleted) {
        statuses.push("deleted");
      }
      setTasks(await repository.getTasksByStatuses(statuses));
      setLoading(false);
    })();
  }, [loadCount]);

  async function updateStatus(task: UtilityEntity.Task, status: UtilityEntity.TaskStatus): Promise<UtilityEntity.Task> {
    const clone = Object.assign({}, task, { status: status });
    const repository = new UtilityRepository();
    await repository.updateTask(clone);
    return clone;
  }

  function syncTasks(task: UtilityEntity.Task) {
    const result = tasks.map(function (item) {
      if (item.id == task.id) {
        return task;
      }
      return item;
    });
    setTasks(result);
  }

  function removeAndSyncTasks(task: UtilityEntity.Task) {
    const result: UtilityEntity.Task[] = [];
    tasks.forEach(function (item) {
      if (item.id == task.id) {
        return;
      }
      result.push(item);
    });
    setTasks(result);
  }

  async function onFormSubmit(e: any) {
    e.preventDefault();

    if (editingTask != null) {
      const repository = new UtilityRepository();
      const clone = Object.assign({}, editingTask, { text: currentTaskValue });
      await repository.updateTask(clone);
      syncTasks(clone);
      setEditingTask(null);
      setCurrentTaskValue("");
    } else {
      const repository = new UtilityRepository();
      const created = await repository.createTask(currentTaskValue);
      setCurrentTaskValue("");
      const result = [created];
      tasks.forEach((item) => {
        result.push(item);
      });
      setTasks(result);
    }
  }

  function onTaskInputChanged(e: any) {
    const value = e.target.value;
    setCurrentTaskValue(value);
    setIsValid(value != "");
  }

  function onEdit(task: UtilityEntity.Task) {
    setCurrentTaskValue(task.text);
    setEditingTask(task);
    setIsValid(true);
    if (nameRef.current) {
      // @ts-ignore
      nameRef.current.focus();
    }
  }

  async function onDone(task: UtilityEntity.Task) {
    syncTasks(await updateStatus(task, "done"));
  }

  async function onUndone(task: UtilityEntity.Task) {
    syncTasks(await updateStatus(task, "in-progress"));
  }

  async function onRestore(task: UtilityEntity.Task) {
    syncTasks(await updateStatus(task, "in-progress"));
  }

  async function onDelete(task: UtilityEntity.Task, forever: boolean) {
    if (forever) {
      const repository = new UtilityRepository();
      await repository.deleteTask(task.id);
      removeAndSyncTasks(task);
    } else {
      syncTasks(await updateStatus(task, "deleted"));
    }
  }

  if (loading) {
    return (
      <div>
        <i className="fa fa-spin fa-spinner"></i>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-grow-1">
        <Form noValidate onSubmit={onFormSubmit} className="flex-grow-1">
          <Form.Group controlId="task-input">
            <InputGroup>
              <Form.Control
                ref={nameRef}
                autoComplete="off"
                value={currentTaskValue}
                onChange={(e) => onTaskInputChanged(e)}
                required
              />
              {isValid ? (
                <InputGroup.Text as="button" className="btn btn-primary">
                  {editingTask ? <i className="fa fa-pencil"></i> : <i className="fa fa-plus"></i>}
                </InputGroup.Text>
              ) : (
                <InputGroup.Text as="button" className="btn btn-secondary" disabled>
                  {editingTask ? <i className="fa fa-pencil"></i> : <i className="fa fa-plus"></i>}
                </InputGroup.Text>
              )}
            </InputGroup>
          </Form.Group>
        </Form>
        <Dropdown autoClose="outside" className="dropdown-filter hide-caret" style={{ marginLeft: "1rem" }}>
          <DropdownButton title={<i className="fa fa-ellipsis"></i>} variant="outline-secondary">
            <Dropdown.Item
              onClick={() => {
                setShowDone(!showDone);
                setLoadCount(loadCount + 1);
              }}
            >
              {showDone ? "Hide Done tasks" : "Show Done tasks"}
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                setShowDeleted(!showDeleted);
                setLoadCount(loadCount + 1);
              }}
            >
              {showDeleted ? "Hide Deleted tasks" : "Show Deleted tasks"}
            </Dropdown.Item>
          </DropdownButton>
        </Dropdown>
      </div>
      <div className="main-container">
        <ul className="list-group">
          {tasks.map(function (task, index) {
            return (
              <LobbyTaskItem
                key={index}
                task={task}
                onDelete={onDelete}
                onEdit={onEdit}
                onRestore={onRestore}
                onDone={onDone}
                onUndone={onUndone}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}
