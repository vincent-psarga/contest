import type { TestPlan } from "../models/TestPlan";
import type { ITestContainer } from "../models/ITestContainer";

export interface ITestPlanBuilder {
  buildTestPlan(testContainers: ITestContainer[]): TestPlan;
}
