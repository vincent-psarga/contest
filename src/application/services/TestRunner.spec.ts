import { describe } from "../dsl/describe";
import { TestRunner } from "./TestRunner";
import { beforeEach } from "../dsl/beforeEach";
import type { IEventBus } from "../../domain/services/events/IEventBus";
import type { ITestContextRegistry } from "../../domain/services/ITestContextRegistry";
import type { ITestContainer } from "../../domain/models/ITestContainer";
import { EventBus } from "./events/EventBus";
import { TestContextRegistry } from "./TestContextRegistry";
import type { ITest } from "../../domain/models/ITest";
import { it } from "../dsl/it";
import { jestExpect as expect } from "@jest/expect";
import { TimeoutExceededError } from "../../domain/errors/TimeoutExceededError";
import { StatusEnum, type TestStatus } from "../../domain/models/TestStatus";
import { ITestFactory } from "../../../test/factories/models/ITestFactory";
import { TestPlanEntryFactory } from "../../../test/factories/models/TestPlanEntryFactory";
import type { TestPlanEntry } from "../../domain/models/TestPlan";
import { ITestSuiteFactory } from "../../../test/factories/models/ITestSuiteFactory";
import { MockCallStocker } from "../../../test/utils/MockCallStocker";

type TestRunnerData = {
  eventBus: IEventBus;
  testContextRegistry: ITestContextRegistry;
  testContainers: ITestContainer[];
  tests: ITest[];
  timeout: number;
};

describe<TestRunnerData>("TestRunner", (context) => {
  let testRunner: TestRunner;

  context.set("eventBus", new EventBus());
  context.set("testContextRegistry", new TestContextRegistry(() => null));
  context.set("timeout", 100);

  beforeEach(async () => {
    testRunner = new TestRunner(
      context.get("eventBus"),
      context.get("testContextRegistry"),
      context.get("timeout"),
    );
  });

  describe<
    TestRunnerData & { testPlanEntry: TestPlanEntry }
  >("#runTestEntry", (context) => {
    context.when(
      "when an entry is marked with skip",
      {
        testPlanEntry: TestPlanEntryFactory({
          skip: true,
        }),
      },
      () => {
        let status: TestStatus;

        beforeEach(async () => {
          status = await testRunner.runTestPlanEntry(
            context.get("testPlanEntry"),
          );
        });

        it("does not execute the test", () => {
          expect(context.get("testPlanEntry").test.body).not.toHaveBeenCalled();
        });

        it("returns a StatusEnum.notRun status", () => {
          expect(status).toEqual({ status: StatusEnum.notRun });
        });
      },
    );

    context.when(
      "the test passes",
      {
        testPlanEntry: TestPlanEntryFactory({
          test: ITestFactory(),
        }),
      },
      () => {
        it("returns a StatusEnum.ok status", async () => {
          const status = await testRunner.runTestPlanEntry(
            context.get("testPlanEntry"),
          );
          expect(status).toEqual({ status: StatusEnum.ok });
        });
      },
    );

    context.when(
      "the test throws an exception",
      {
        testPlanEntry: TestPlanEntryFactory({
          test: ITestFactory({
            body: () => {
              throw new Error("Some error");
            },
          }),
        }),
      },
      () => {
        it("returns a StatusEnum.fail status", async () => {
          const status = await testRunner.runTestPlanEntry(
            context.get("testPlanEntry"),
          );
          expect(status).toEqual({
            status: StatusEnum.fail,
            error: new Error("Some error"),
          });
        });
      },
    );

    context.when(
      "ancestors have hooks defined",
      {
        testPlanEntry: TestPlanEntryFactory({
          test: ITestFactory({
            body: MockCallStocker.fn("test"),
          }),
          ancestors: [
            ITestSuiteFactory({
              hooks: { beforeEach: MockCallStocker.fn("first before each") },
            }),
            ITestSuiteFactory({
              hooks: { beforeEach: MockCallStocker.fn("second before each") },
            }),
          ],
        }),
      },
      () => {
        beforeEach(() => {
          MockCallStocker.resetCalls();
        });

        it("calls the beforeEach hooks in order before calling the test body", async () => {
          await testRunner.runTestPlanEntry(context.get("testPlanEntry"));

          expect(MockCallStocker.calls).toEqual([
            "first before each",
            "second before each",
            "test",
          ]);
        });
      },
    );

    context.when(
      "test takes longer than the expected timeout",
      {
        testPlanEntry: TestPlanEntryFactory({
          timeout: 10,
          test: ITestFactory({
            name: "Timeout test",
            body: async () => {
              return new Promise((resolve) => setTimeout(resolve, 15));
            },
          }),
        }),
      },
      () => {
        it("fails with a TimeoutExceededError", async () => {
          expect(
            await testRunner.runTestPlanEntry(context.get("testPlanEntry")),
          ).toEqual({
            status: StatusEnum.fail,
            error: new TimeoutExceededError("Timeout test", 10),
          });
        });

        context.when(
          "the entry specifies a longer timeout",
          {
            testPlanEntry: TestPlanEntryFactory({
              timeout: 20,
              test: ITestFactory({
                name: "Timeout test",
                body: async () => {
                  return new Promise((resolve) => setTimeout(resolve, 15));
                },
              }),
            }),
          },
          () => {
            it("allows the test to finish", async () => {
              expect(
                await testRunner.runTestPlanEntry(context.get("testPlanEntry")),
              ).toEqual({
                status: StatusEnum.ok,
              });
            });
          },
        );
      },
    );
  });
});
