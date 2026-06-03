import type {Hooks, ITestSuite} from "../models/ITestSuite";
import type {ITest} from "../models/ITest";
import type {TestBody} from "../models/TestBody";
import type {ITestFile} from "../models/ITestFile";
import type {ITestContainer} from "../models/ITestContainer";

export interface ITestRegistry {
    testContainers: ITestContainer[];
    currentTestContainer: ITestContainer | null;

    registerTest(test: ITest): void;
    registerTestFile(testFile: ITestFile, callback: () => Promise<void>): Promise<void>;
    registerTestSuite(testSuite: ITestSuite, callback: () => void): void;
    registerHook(hook: Hooks, body: TestBody): void;
}
