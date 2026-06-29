import type { IUseCase } from "./IUseCase";
import type { User } from "../models/User";

export type LoginCommand = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: Omit<User, "password">;
};

export type ILoginUseCase = IUseCase<LoginCommand, LoginResponse>;
