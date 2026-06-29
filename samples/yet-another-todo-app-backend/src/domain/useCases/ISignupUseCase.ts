import type { User } from "../models/User";
import type { IUseCase } from "./IUseCase";

export type SignUpCommand = {
  email: string;
  password: string;
};

export type SignupResponse = {
  user: Omit<User, "password">;
};

export type ISignupUseCase = IUseCase<SignUpCommand, SignupResponse>;
