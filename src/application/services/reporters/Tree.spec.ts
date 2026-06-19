import { describe } from "../../dsl/describe";
import { it } from "../../dsl/it";
import { jestExpect as expect } from "@jest/expect";
import { Tree } from "./Tree";

describe("Tree", () => {
  it("builds a tree", () => {
    const tree = new Tree<string, number>();

    tree.addLeaf(["a", "b", "c"], 1);
    tree.addLeaf(["a", "b", "c"], 1.1);
    tree.addLeaf(["a", "b", "d"], 2);
    tree.addLeaf(["e"], 3);

    expect(tree.display()).toEqual([
      "a",
      "  b",
      "    c",
      "      1",
      "      1.1",
      "    d",
      "      2",
      "e",
      "  3",
    ]);
  });
});
