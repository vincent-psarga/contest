import { describe } from "../../application/dsl/describe";
import { it } from "../../application/dsl/it";
import { jestExpect as expect } from "@jest/expect";
import { globMatch } from "./globMatch";

describe("globMatch", () => {
  it("returns true for exact matches", () => {
    expect(globMatch("something", ["something"])).toBe(true);
  });

  it("returns false for non-exact matches", () => {
    expect(globMatch("something-else", ["something"])).toBe(false);
  });

  describe("when using * as wildcard", () => {
    it("returns true if the path matches", () => {
      expect(globMatch("myFile.spec.ts", ["*.ts"])).toBe(true);
    });

    it("returns true if there any match", () => {
      expect(globMatch("myFile.spec.ts", ["*.ts", "*.py"])).toBe(true);
    });

    it("returns true if a single folder matches the wildcard", () => {
      expect(globMatch("test/myDir/myFile.spec.ts", ["test/*/*.ts"])).toBe(
        true,
      );
    });

    it("returns false if multiple folders match the wildcard", () => {
      expect(
        globMatch("test/myDir/myOther/myFile.spec.ts", ["test/*/*.ts"]),
      ).toBe(false);
    });
  });

  describe("when using ** as wildcard", () => {
    it("returns true when multiple folders match the wildcard", () => {
      expect(
        globMatch("test/myDir/myOther/myFile.spec.ts", ["test/**/*.ts"]),
      ).toBe(true);
    });
  });
});
