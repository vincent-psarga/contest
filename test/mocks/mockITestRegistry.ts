import type { ITestRegistry } from "../../src/domain/services/ITestRegistry";
import type { Mocked } from "jest-mock";
import { fn } from "jest-mock";

export function mockITestRegistry(): Mocked<ITestRegistry> {
  return {
    currentTestContainer: null,
    testContainers: [],
    registerHook: fn(),
    registerSharedContext: fn(),
    registerTest: fn(),
    registerTestFile: fn(),
    registerTestSuite: fn(),
  };
}
