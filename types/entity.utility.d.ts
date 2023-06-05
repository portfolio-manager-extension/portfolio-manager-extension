declare namespace UtilityEntity {
  type TaskStatus = "in-progress" | "done" | "deleted";
  interface Task extends Entity.ITimestamp {
    id: string;
    text: string;
    status: TaskStatus;
  }
}
