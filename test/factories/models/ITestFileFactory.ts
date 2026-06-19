import { ITestContainerFactory } from "./ITestContainerFactory";
import type { ITestFile } from "../../../src/domain/models/ITestFile";
import { makeFactory } from "../Factory";
import { fn } from "jest-mock";

export const ITestFileFactory = makeFactory<ITestFile>(() => {
  const container = ITestContainerFactory();

  return {
    ...container,
    isITestFile: fn<() => boolean>(),
    path: "path/to/file.spec.ts",
  };
});
