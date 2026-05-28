import type {ITestSuite} from "../models/ITestSuite";
import type {ITest} from "../models/ITest";

export interface ITestRegistry {
    testSuites: ITestSuite<unknown>[];

    registerTest(test: ITest): void;
    registerTestSuite<T>(testSuite: ITestSuite<T>, callback: () => void | Promise<void>): Promise<void>;
}
