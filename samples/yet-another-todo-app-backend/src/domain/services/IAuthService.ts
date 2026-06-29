import type { User } from "../models/User";

export interface IAuthService {
  signup(email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<User>;
}
