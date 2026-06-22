import { describe } from "./describe";
import { it } from "./it";
import { jestExpect as expect } from "@jest/expect";
import { ContextNotSetError } from "../../domain/errors/ContextNotSetError";
import { sharedContext } from "./sharedContext";

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

const projectContext = userContext.extends<{
  project: {
    name: string;
  };
}>("with project", (context) => {
  context.set("project", () => ({
    name: `${context.get("username")}'s project`,
  }));
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

  context.with(projectContext, (contextWithUserAndProject) => {
    it("properly loads ancestor context", () => {
      expect(contextWithUserAndProject.get("project")).toEqual({
        name: "someone@example.com's project",
      });
    });

    describe("when a property is overridden", () => {
      contextWithUserAndProject.set("username", "bob@example.com");

      it("properly loads ancestor context with overridden properties", () => {
        expect(contextWithUserAndProject.get("project")).toEqual({
          name: "bob@example.com's project",
        });
      });
    });
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
