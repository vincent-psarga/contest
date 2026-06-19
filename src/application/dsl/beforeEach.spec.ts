import { describe } from "./describe";
import { beforeEach } from "./beforeEach";
import * as assert from "node:assert";
import { it } from "./it";

describe("beforeEach", () => {
  let myString: string;

  beforeEach(() => {
    myString = "Hello world!";
  });

  it("runs before the tests", () => {
    assert.equal(myString, "Hello world!");
  });

  describe("when describe blocks are imbricated", () => {
    beforeEach(() => {
      myString += "\nHow is it going?";
    });

    it("runs all the beforeEach blocks in order", () => {
      assert.equal(myString, "Hello world!\nHow is it going?");
    });
  });
});
