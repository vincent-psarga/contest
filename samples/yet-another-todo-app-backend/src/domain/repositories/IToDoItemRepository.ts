import type { ToDoList } from "../models/ToDoList";
import type { ToDoItem } from "../models/ToDoItem";

export interface IToDoItemRepository {
  create(toDoList: ToDoList, toDoItem: ToDoItem): Promise<ToDoItem>;
  getToDoItems(toDoList: ToDoList): Promise<ToDoItem[]>;
}
