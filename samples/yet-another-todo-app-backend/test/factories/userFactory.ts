import type { User } from "../../src/domain/models/User";
import { makeFactory } from "./Factory";

export const userFactory = makeFactory<User>(() => ({
  id: "123",
  email: "bob@example.com",
  password: "some-secret-password",
  displayName: "Bob",
}));
