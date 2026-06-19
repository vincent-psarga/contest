import type {TestStatus} from "../models/TestStatus";
import type {TestSuiteStatus} from "../models/TestSuiteStatus";
import type {TestPlan, TestPlanEntry} from "../models/TestPlan";

export interface ITestRunner {
    runTestPlanEntry(testEntry: TestPlanEntry): Promise<TestStatus>
    runTestPlan(testPlan: TestPlan): Promise<TestSuiteStatus>;
}
