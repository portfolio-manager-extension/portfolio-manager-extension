import Dexie from "dexie";
import { v4 as uuid } from "uuid";
import { sortByTimestampDesc } from "../ui/app/fn/sortByTimestamp";

const DB_VERSION = 1;
const TASK_TABLE = "tasks";
const databases: Map<string, Dexie> = new Map();

function makeDB(): Dexie {
  const name = "utility";
  if (databases.has(name)) {
    return databases.get(name) as Dexie;
  }

  const db = new Dexie(name);
  db.version(DB_VERSION).stores({
    [TASK_TABLE]: "id, status",
  });
  databases.set(name, db);
  return db;
}

export default class UtilityRepository implements Storage.UtilityRepository {
  private db: Dexie;

  constructor() {
    this.db = makeDB();
  }

  async createTask(text: string): Promise<UtilityEntity.Task> {
    const task: UtilityEntity.Task = {
      id: uuid(),
      text: text,
      status: "in-progress",
      timestamp: Date.now(),
    };
    await this.db.table(TASK_TABLE).put(task);
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await this.db.table(TASK_TABLE).delete(id);
  }

  async getAll(): Promise<UtilityEntity.Task[]> {
    return this.db.table(TASK_TABLE).toArray();
  }

  async getTasksByStatuses(statuses: UtilityEntity.TaskStatus[]): Promise<UtilityEntity.Task[]> {
    return sortByTimestampDesc(await this.db.table(TASK_TABLE).where("status").anyOf(statuses).toArray());
  }

  async updateTask(task: UtilityEntity.Task): Promise<void> {
    await this.db.table(TASK_TABLE).put(task);
  }

  async save(task: UtilityEntity.Task): Promise<void> {
    await this.db.table(TASK_TABLE).put(task);
  }
}
