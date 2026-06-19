import { describe } from "./describe";
import type { IContext } from "../../domain/models/IContext";
import type { ISharedContext } from "../../domain/models/ISharedContext";
import { SharedContext } from "../models/SharedContext";
import { it } from "./it";
import { jestExpect as expect } from "@jest/expect";
import { ContextNotSetError } from "../../domain/errors/ContextNotSetError";

function sharedContext<T>(
  name: string,
  setup: (context: IContext<T>) => void,
): ISharedContext<T> {
  return new SharedContext(name, setup);
}

enum UserStatus {
  pending = "pending",
  activated = "activated",
  locked = "locked",
}

type UserContext = {
  username: string;
  password: string;
  status: UserStatus;
};
const userContext = sharedContext<UserContext>("with user", (context) => {
  context.set("username", "someone@example.com");
  context.set("password", "superS3cr3t");
  context.set("status", UserStatus.activated);
});

describe("sharedContext", (context) => {
  context.with(userContext, (contextWithUser) => {
    it("loads the sharedContext properly", () => {
      expect(contextWithUser.get("status")).toEqual(UserStatus.activated);
    });
  });

  it("shared context is not spread to sibling tests", () => {
    // @ts-ignore - 'username' is not part of the base context, so `context.get('username')` will throw an error
    const getUsername = () => context.get("username");

    expect(getUsername).toThrow(new ContextNotSetError("username"));
  });
});

describe.with(
  "Using shared context at describe level",
  userContext,
  (context) => {
    it("loads the sharedContext properly", () => {
      expect(context.get("username")).toEqual("someone@example.com");
    });
  },
);
