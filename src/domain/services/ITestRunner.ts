import type {ITestSuite} from "../models/ITestSuite";
import type {ITest} from "../models/ITest";
import type {TestStatus} from "../../application/models/TestStatus";

export interface ITestRunner {
    runTestSuites<T>(testSuite: ITestSuite<T>[]): Promise<TestStatus>;
    runTestSuite<T>(testSuite: ITestSuite<T>): Promise<TestStatus>;
    runTest(test: ITest): Promise<TestStatus>;
}
