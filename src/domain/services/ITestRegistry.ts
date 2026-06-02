import type {Hooks, ITestSuite} from "../models/ITestSuite";
import type {ITest} from "../models/ITest";
import type {TestBody} from "../models/TestBody";

export interface ITestRegistry {
    testSuites: ITestSuite[];
    currentTestSuite: ITestSuite | null;

    registerTest(test: ITest): void;
    registerTestSuite(testSuite: ITestSuite, callback: () => void): void;
    registerHook(hook: Hooks, body: TestBody): void;

    beginSuite(testSuite: ITestSuite): void;
    endSuite(): void;
}
