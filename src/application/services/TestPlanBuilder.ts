import type { ITestPlanBuilder } from "../../domain/services/ITestPlanBuilder";
import type { ITestContainer } from "../../domain/models/ITestContainer";
import type { TestPlan } from "../../domain/models/TestPlan";

export class TestPlanBuilder implements ITestPlanBuilder {
  constructor(private readonly defaultTimeout: number) {}

  buildTestPlan(testContainers: ITestContainer[]): TestPlan {
    const testPlan = this._buildTestPlan(testContainers, {
      ancestors: [],
      only: false,
      skip: false,
      timeout: this.defaultTimeout,
    });
    const onlyTests = testPlan.filter((testPlanEntry) => testPlanEntry.only);

    if (onlyTests.length > 0) {
      return onlyTests;
    }
    return testPlan;
  }

  private _buildTestPlan(
    testContainers: ITestContainer[],
    {
      ancestors,
      only,
      skip,
      timeout,
    }: {
      ancestors: ITestContainer[];
      only: boolean;
      skip: boolean;
      timeout: number;
    },
  ): TestPlan {
    return testContainers.reduce((acc, container) => {
      for (const test of container.tests) {
        acc.push({
          test,
          ancestors: [...ancestors, container],
          only: only || container.only || test.only,
          skip: skip || container.skip || test.skip,
          timeout: container.timeout ?? test.timeout ?? timeout,
        });
      }

      acc.push(
        ...this._buildTestPlan(container.testContainers, {
          ancestors: [...ancestors, container],
          only: only || container.only,
          skip: skip || container.skip,
          timeout: container.timeout ?? timeout,
        }),
      );

      return acc;
    }, [] as TestPlan);
  }
}
