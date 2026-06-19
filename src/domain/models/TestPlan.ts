import type { ITest } from "./ITest";
import type { ITestContainer } from "./ITestContainer";

export type TestPlanEntry = {
  test: ITest;
  ancestors: ITestContainer[];
  only: boolean;
  skip: boolean;
  timeout: number;
};
export type TestPlan = TestPlanEntry[];
