import type { Project } from "../models/Project";
import type { ToDoList } from "../models/ToDoList";

export interface ITodoListRepository {
  create(project: Project, toDoList: ToDoList): Promise<ToDoList>;
  getProjectToDoLists(project: Project): Promise<ToDoList[]>;
}
