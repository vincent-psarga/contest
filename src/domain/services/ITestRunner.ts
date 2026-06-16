import type {ITest} from "../models/ITest";
import type {TestStatus} from "../models/TestStatus";
import type {TestSuiteStatus} from "../models/TestSuiteStatus";
import type {ITestContainer} from "../models/ITestContainer";

export interface ITestRunner {
    runTestContainers(testContainers: ITestContainer[]): Promise<TestSuiteStatus>;
    runTest(test: ITest, ancestors: ITestContainer[]): Promise<TestStatus>;
}
