import { describe } from "./describe";
import { it } from "./it";
import { jestExpect as expect } from "@jest/expect";
import { ContextNotSetError } from "../../domain/errors/ContextNotSetError";
import { fn } from "jest-mock";

describe<{ name: string }>("context", (context) => {
  describe("when context key has not been set", () => {
    it("throws an exception", () => {
      expect(() => context.get("name")).toThrow(new ContextNotSetError("name"));
    });
  });

  describe("when context is set", () => {
    context.set("name", "test");

    it("uses the value set", () => {
      expect(context.get("name")).toEqual("test");
    });
  });

  describe("when a context is set multiple times", () => {
    const firstMock = fn<() => string>().mockReturnValue("first-mock");
    const secondMock = fn<() => string>().mockReturnValue("second-mock");

    context.set("name", firstMock);

    describe("inside the sub test suite", () => {
      context.set("name", secondMock);

      it("returns the closest value", () => {
        expect(context.get("name")).toEqual("second-mock");
      });

      it("does not use callbacks from higher levels", () => {
        context.get("name");

        expect(firstMock).not.toHaveBeenCalled();
      });
    });
  });

  describe("using context.when", () => {
    context.when({ name: "Coucou" }, () => {
      it("properly sets the context", () => {
        expect(context.get("name")).toEqual("Coucou");
      });
    });

    context.when("using a titled context.when", { name: "Coucou" }, () => {
      it("properly sets the context", () => {
        expect(context.get("name")).toEqual("Coucou");
      });
    });
  });
});
