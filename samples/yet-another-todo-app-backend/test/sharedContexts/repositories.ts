import type { IRepositories } from "../../src/domain/repositories/IRepositories";
import { MemoryUserRepository } from "../../src/infra/repositories/MemoryUserRepository";

export const repositories = sharedContext<IRepositories>(
  "repositories",
  (context) => {
    context.set("userRepository", () => new MemoryUserRepository());
  },
);
