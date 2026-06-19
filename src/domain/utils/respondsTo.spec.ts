import { describe } from "../../application/dsl/describe";
import { it } from "../../application/dsl/it";
import { jestExpect as expect } from "@jest/expect";
import { respondsTo } from "./respondsTo";

describe<{ tbd: unknown }>("respondsTo", (context) => {
  context.when({ tbd: null }, () => {
    it("return false", () => {
      expect(respondsTo(context.get("tbd"), "whatever")).toBe(false);
    });
  });

  context.when({ tbd: undefined }, () => {
    it("return false", () => {
      expect(respondsTo(context.get("tbd"), "whatever")).toBe(false);
    });
  });

  describe("when tbd is an object", () => {
    context.when(
      "when tbd does not have the expected property",
      { tbd: {} },
      () => {
        it("returns false", () => {
          expect(respondsTo(context.get("tbd"), "whatever")).toBe(false);
        });
      },
    );

    context.when(
      "when tbd does has the property but is not a function",
      { tbd: { whatever: true } },
      () => {
        it("returns false", () => {
          expect(respondsTo(context.get("tbd"), "whatever")).toBe(false);
        });
      },
    );

    context.when(
      "when tbd does has the property as a function",
      { tbd: { whatever: () => false } },
      () => {
        it("returns true", () => {
          expect(respondsTo(context.get("tbd"), "whatever")).toBe(true);
        });
      },
    );
  });
});
