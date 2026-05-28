import type {ITestSuite} from "../models/ITestSuite";
import type {ITest} from "../models/ITest";
import type {TestStatus} from "../models/TestStatus";
import type {TestSuiteStatus} from "../models/TestSuiteStatus";

export interface ITestRunner {
    runTestSuites<T>(testSuite: ITestSuite<T>[]): Promise<TestSuiteStatus>;
    runTestSuite<T>(testSuite: ITestSuite<T>, ancestors: ITestSuite<T>[]): Promise<TestSuiteStatus>;
    runTest(test: ITest, ancestors: ITestSuite<unknown>[]): Promise<TestStatus>;
}
