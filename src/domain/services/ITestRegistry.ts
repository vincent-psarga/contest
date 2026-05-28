import type {Hooks, ITestSuite} from "../models/ITestSuite";
import type {ITest} from "../models/ITest";
import type {TestBody} from "../models/TestBody";

export interface ITestRegistry {
    testSuites: ITestSuite<unknown>[];

    registerTest(test: ITest): void;
    registerTestSuite<T>(testSuite: ITestSuite<T>, callback: () => void | Promise<void>): Promise<void>;
    registerHook(hook: Hooks, body: TestBody): Promise<void>;
}
