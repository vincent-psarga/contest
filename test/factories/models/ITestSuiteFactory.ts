import { makeFactory } from "../Factory";
import type { ITestSuite } from "../../../src/domain/models/ITestSuite";
import { ITestContainerFactory } from "./ITestContainerFactory";
import { fn } from "jest-mock";

export const ITestSuiteFactory = makeFactory<ITestSuite>(() => {
  return {
    ...ITestContainerFactory(),
    hooks: {},
    name: "My test suite",
    addHook: fn(),
    isITestSuite: fn<() => boolean>().mockReturnValue(true),
  };
});
