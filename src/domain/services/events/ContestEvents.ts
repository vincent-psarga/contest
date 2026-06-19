import type { ITest } from "../../models/ITest";
import { Hooks, type ITestSuite } from "../../models/ITestSuite";
import type { TestStatus } from "../../models/TestStatus";
import type { TestSuiteStatus } from "../../models/TestSuiteStatus";
import type { ITestContainer } from "../../models/ITestContainer";
import type { ITestFile } from "../../models/ITestFile";

export enum ContestEvents {
  TestFileLoaded = "TestFileLoaded",
  TestSuiteLoaded = "TestSuiteLoaded",
  HookRegistered = "HookRegistered",
  TestLoaded = "TestLoaded",
  TestStarted = "TestStarted",
  TestEnded = "TestEnded",
  TestSuiteStarted = "TestSuiteStarted",
  TestSuiteEnded = "TestSuiteEnded",
  TestFileStarted = "TestFileStarted",
  TestFileEnded = "TestFileEnded",
  TestRunStarted = "TestRunStarted",
  TestRunEnded = "TestRunEnded",
}

type EventPayloadMap<E extends string> = {
  [K in E]: Object;
};

const payloadByEvent = {
  [ContestEvents.TestFileLoaded]: {} as { testFile: ITestFile },
  [ContestEvents.TestSuiteLoaded]: {} as {
    testSuite: ITestSuite;
    container: ITestContainer | null;
  },
  [ContestEvents.HookRegistered]: {} as { testSuite: ITestSuite; hook: Hooks },
  [ContestEvents.TestLoaded]: {} as { test: ITest; testSuite: ITestSuite },
  [ContestEvents.TestStarted]: {} as { test: ITest },
  [ContestEvents.TestEnded]: {} as { test: ITest; status: TestStatus },
  [ContestEvents.TestSuiteStarted]: {} as { testSuite: ITestSuite },
  [ContestEvents.TestSuiteEnded]: {} as {
    testSuite: ITestSuite;
    status: TestSuiteStatus;
  },
  [ContestEvents.TestFileStarted]: {} as { testFile: ITestFile },
  [ContestEvents.TestFileEnded]: {} as {
    testFile: ITestFile;
    status: TestSuiteStatus;
  },
  [ContestEvents.TestRunStarted]: {},
  [ContestEvents.TestRunEnded]: {} as { status: TestSuiteStatus },
} satisfies EventPayloadMap<ContestEvents>;

export type PayloadByEvent = typeof payloadByEvent;
