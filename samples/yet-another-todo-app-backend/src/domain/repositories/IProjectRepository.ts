import type { User } from "../models/User";
import type { Project } from "../models/Project";

export interface IProjectRepository {
  create(user: User, project: Project): Promise<Project>;
  getUserProjects(user: User): Promise<Project[]>;
}
