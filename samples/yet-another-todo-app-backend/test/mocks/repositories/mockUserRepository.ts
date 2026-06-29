import { makeMock } from "../MockService";
import type { IUserRepository } from "../../../src/domain/repositories/IUserRepository";

export const mockUserRepository = makeMock<IUserRepository>({
  findByEmailAndPassword: fn(),
  create: fn(),
});
