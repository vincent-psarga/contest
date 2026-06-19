import type { ITestContainer } from "../../domain/models/ITestContainer";
import { describe } from "../dsl/describe";
import type { TestPlan } from "../../domain/models/TestPlan";
import { it } from "../dsl/it";
import { jestExpect as expect } from "@jest/expect";
import { beforeEach } from "../dsl/beforeEach";
import { ITestContainerFactory } from "../../../test/factories/models/ITestContainerFactory";
import { ITestFactory } from "../../../test/factories/models/ITestFactory";
import { ITestFileFactory } from "../../../test/factories/models/ITestFileFactory";
import { TestPlanBuilder } from "./TestPlanBuilder";

describe<{
  testContainers: ITestContainer[];
  defaultTimeout: number;
}>("TestPlanBuilder", (context) => {
  let testPlanBuilder: TestPlanBuilder;

  context.set("defaultTimeout", 123);

  beforeEach(() => {
    testPlanBuilder = new TestPlanBuilder(context.get("defaultTimeout"));
  });

  describe("#buildTestPlan", () => {
    context.when("test containers are empty", { testContainers: [] }, () => {
      it("returns an empty TestPlan", () => {
        expect(
          testPlanBuilder.buildTestPlan(context.get("testContainers")),
        ).toEqual([]);
      });
    });

    context.when(
      "test containers are provided",
      {
        testContainers: [
          ITestFileFactory({
            path: "path/to/firstFile.spec.ts",
            tests: [
              ITestFactory({ name: "First test" }),
              ITestFactory({ name: "Second test" }),
            ],
          }),
          ITestFileFactory({
            path: "path/to/secondFile.spec.ts",
            tests: [ITestFactory({ name: "A test in the second file" })],
          }),
        ],
      },
      () => {
        it("returns a line for each test", () => {
          const testContainers = context.get("testContainers");

          const expected: TestPlan = [
            {
              test: testContainers[0]!.tests[0]!,
              ancestors: [testContainers[0]!],
              only: false,
              skip: false,
              timeout: context.get("defaultTimeout"),
            },
            {
              test: testContainers[0]!.tests[1]!,
              ancestors: [testContainers[0]!],
              only: false,
              skip: false,
              timeout: context.get("defaultTimeout"),
            },
            {
              test: testContainers[1]!.tests[0]!,
              ancestors: [testContainers[1]!],
              only: false,
              skip: false,
              timeout: context.get("defaultTimeout"),
            },
          ];

          expect(testPlanBuilder.buildTestPlan(testContainers)).toEqual(
            expected,
          );
        });
      },
    );

    context.when(
      "test containers are imbricated",
      {
        testContainers: [
          ITestContainerFactory({
            tests: [ITestFactory(), ITestFactory()],
            testContainers: [
              ITestContainerFactory({
                tests: [ITestFactory()],
              }),
            ],
          }),
        ],
      },
      () => {
        it("properly builds test plan and respects the hierarchy", () => {
          const testContainers = context.get("testContainers");

          const expected: TestPlan = [
            {
              test: testContainers[0]!.tests[0]!,
              ancestors: [testContainers[0]!],
              only: false,
              skip: false,
              timeout: context.get("defaultTimeout"),
            },
            {
              test: testContainers[0]!.tests[1]!,
              ancestors: [testContainers[0]!],
              only: false,
              skip: false,
              timeout: context.get("defaultTimeout"),
            },
            {
              test: testContainers[0]!.testContainers[0]!.tests[0]!,
              ancestors: [
                testContainers[0]!,
                testContainers[0]!.testContainers[0]!,
              ],
              only: false,
              skip: false,
              timeout: context.get("defaultTimeout"),
            },
          ];

          expect(testPlanBuilder.buildTestPlan(testContainers)).toEqual(
            expected,
          );
        });
      },
    );

    context.when(
      "when tests or container specify .only",
      {
        testContainers: [
          ITestContainerFactory({
            tests: [ITestFactory(), ITestFactory({ only: true })],
            testContainers: [
              ITestContainerFactory({
                tests: [ITestFactory()],
              }),
            ],
          }),
          ITestContainerFactory({
            tests: [ITestFactory()],
            only: true,
          }),
        ],
      },
      () => {
        it("filters out the other tests", () => {
          const testContainers = context.get("testContainers");

          const expected: TestPlan = [
            {
              test: testContainers[0]!.tests[1]!,
              ancestors: [testContainers[0]!],
              only: true,
              skip: false,
              timeout: context.get("defaultTimeout"),
            },
            {
              test: testContainers[1]!.tests[0]!,
              ancestors: [testContainers[1]!],
              only: true,
              skip: false,
              timeout: context.get("defaultTimeout"),
            },
          ];

          expect(testPlanBuilder.buildTestPlan(testContainers)).toEqual(
            expected,
          );
        });
      },
    );

    context.when(
      "when tests or container specify .skip",
      {
        testContainers: [
          ITestContainerFactory({
            tests: [ITestFactory(), ITestFactory({ skip: true })],
          }),
          ITestContainerFactory({
            tests: [ITestFactory()],
            skip: true,
          }),
        ],
      },
      () => {
        it("marks the corresponding rows as skipped", () => {
          expect(
            testPlanBuilder.buildTestPlan(context.get("testContainers")),
          ).toEqual([
            expect.objectContaining({ skip: false }),
            expect.objectContaining({ skip: true }),
            expect.objectContaining({ skip: true }),
          ]);
        });
      },
    );

    context.when(
      "when tests or container specify a timeout",
      {
        testContainers: [
          ITestContainerFactory({
            tests: [ITestFactory({ timeout: 10 }), ITestFactory()],
          }),
          ITestContainerFactory({
            timeout: 15,
            tests: [ITestFactory()],
          }),
        ],
      },
      () => {
        it("marks the corresponding rows as skipped", () => {
          expect(
            testPlanBuilder.buildTestPlan(context.get("testContainers")),
          ).toEqual([
            expect.objectContaining({ timeout: 10 }),
            expect.objectContaining({ timeout: context.get("defaultTimeout") }),
            expect.objectContaining({ timeout: 15 }),
          ]);
        });
      },
    );
  });
});
