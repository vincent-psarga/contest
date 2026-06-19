import type {ITest} from "../models/ITest";
import type {TestStatus} from "../models/TestStatus";
import type {TestSuiteStatus} from "../models/TestSuiteStatus";
import type {ITestContainer} from "../models/ITestContainer";
import type {TestPlanEntry} from "../models/ITestPlan";

export interface ITestRunner {
    runTestContainers(testContainers: ITestContainer[]): Promise<TestSuiteStatus>;
    runTestPlanEntry(testEntry: TestPlanEntry): Promise<TestStatus>
}
