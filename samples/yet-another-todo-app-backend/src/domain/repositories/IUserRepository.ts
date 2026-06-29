import type { User } from "../models/User";

export interface IUserRepository {
  create(user: Omit<User, "id">): Promise<User>;
  findByEmailAndPassword(email: string, password: string): Promise<User>;
}
