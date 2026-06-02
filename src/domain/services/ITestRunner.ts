import type {ITestSuite} from "../models/ITestSuite";
import type {ITest} from "../models/ITest";
import type {TestStatus} from "../models/TestStatus";
import type {TestSuiteStatus} from "../models/TestSuiteStatus";

export interface ITestRunner {
    runTestSuites(testSuite: ITestSuite[]): Promise<TestSuiteStatus>;
    runTestSuite(testSuite: ITestSuite, ancestors: ITestSuite[]): Promise<TestSuiteStatus>;
    runTest(test: ITest, ancestors: ITestSuite[]): Promise<TestStatus>;
}
