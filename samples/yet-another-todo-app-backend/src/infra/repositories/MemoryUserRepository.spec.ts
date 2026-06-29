import { MemoryUserRepository } from "./MemoryUserRepository";
import { IUserRepositorySharedExamples } from "./IUserRepositorySharedExamples";

describe("MemoryUserRepository", () => {
  itBehavesLike(IUserRepositorySharedExamples, {
    makeRepository: () => new MemoryUserRepository(),
  });
});
