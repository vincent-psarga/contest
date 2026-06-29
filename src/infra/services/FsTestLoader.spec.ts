import { describe } from "../../application/dsl/describe";
import { beforeEach } from "../../application/dsl/beforeEach";
import { it } from "../../application/dsl/it";
import {
  FsTestLoader,
  type FsTestLoaderConstructorOptions,
  type ReadDir,
} from "./FsTestLoader";
import { mockIEventBus } from "../../../test/mocks/mockIEventBus";
import { mockITestRegistry } from "../../../test/mocks/mockITestRegistry";
import { fn } from "jest-mock";
import { jestExpect as expect } from "@jest/expect";
import type { ITestFile } from "../../domain/models/ITestFile";

describe<FsTestLoaderConstructorOptions>("FsTestLoader", (context) => {
  context.set("eventBus", mockIEventBus);
  context.set("testRegistry", mockITestRegistry);
  context.set("isFile", () => fn<(path: string) => boolean>());
  context.set("readDir", () => fn<ReadDir>());

  let fsTestLoader: FsTestLoader;

  beforeEach(() => {
    fsTestLoader = new FsTestLoader({
      eventBus: context.get("eventBus"),
      testRegistry: context.get("testRegistry"),
      readDir: context.get("readDir")!,
      isFile: context.get("isFile")!,
    });
  });

  describe<
    FsTestLoaderConstructorOptions & { includes: string[]; excludes: string[] }
  >("#load", (context) => {
    context.set("includes", []);
    context.set("excludes", []);

    let testFiles: ITestFile[];

    beforeEach(async () => {
      testFiles = await fsTestLoader.load("", {
        includes: context.get("includes"),
        excludes: context.get("excludes"),
      });
    });

    context.when(
      "the directory is empty",
      { readDir: () => fn<ReadDir>().mockReturnValue([]) },
      () => {
        it("returns an empty list of test files", async () => {
          expect(testFiles).toEqual([]);
        });
      },
    );

    context.when(
      "directory contains files",
      {
        includes: ["**/*.spec.ts"],
        readDir: () =>
          fn<ReadDir>().mockReturnValue([
            {
              name: "file1.ts",
              isFile: () => true,
              isDirectory: () => false,
            },
            {
              name: "file1.spec.ts",
              isFile: () => true,
              isDirectory: () => false,
            },
          ]),
      },
      async () => {
        it("registers each file within the test registry", () => {
          expect(
            context.get("testRegistry").registerTestFile,
          ).toHaveBeenCalledWith(
            expect.objectContaining({
              path: "file1.spec.ts",
            }),
            expect.anything(),
          );
        });

        it("returns the list of test files", () => {
          expect(testFiles).toEqual([
            expect.objectContaining({
              path: "file1.spec.ts",
            }),
          ]);
        });

        context.when(
          "files does not match inclusion matcher",
          { includes: ["**/*.test.ts"] },
          () => {
            it("does not register the test file", () => {
              expect(
                context.get("testRegistry").registerTestFile,
              ).not.toHaveBeenCalled();
            });

            it("returns an empty list", () => {
              expect(testFiles).toEqual([]);
            });
          },
        );

        context.when(
          "file matches an exclusion matcher",
          { excludes: ["**/*.ts"] },
          () => {
            it("does not register the test file", () => {
              expect(
                context.get("testRegistry").registerTestFile,
              ).not.toHaveBeenCalled();
            });

            it("returns an empty list", () => {
              expect(testFiles).toEqual([]);
            });
          },
        );
      },
    );
  });
});
