import type { ITest } from "../../models/ITest";
import {Hooks, type ITestSuite} from "../../models/ITestSuite";
import type {TestStatus} from "../../models/TestStatus";
import type {TestSuiteStatus} from "../../models/TestSuiteStatus";

export enum ContestEvents {
    TestFileLoaded = "TestFileLoaded",
    TestSuiteLoaded = 'TestSuiteLoaded',
    HookRegistered = "HookRegistered",
    TestLoaded = 'TestLoaded',
    TestStarted = 'TestStarted',
    TestEnded = 'TestEnded',
    TestSuiteStarted = 'TestSuiteStarted',
    TestSuiteEnded = 'TestSuiteEnded',
}

type EventPayloadMap<E extends string> = {
    [K in E]: Object;
};

const payloadByEvent = {
    [ContestEvents.TestFileLoaded]: {} as { testFile: { path: string } },
    [ContestEvents.TestSuiteLoaded]: {} as { testSuite: ITestSuite<unknown>, container: ITestSuite<unknown> | null },
    [ContestEvents.HookRegistered]: {} as { testSuite: ITestSuite<unknown>, hook: Hooks },
    [ContestEvents.TestLoaded]: {} as { test: ITest, testSuite: ITestSuite<unknown> },
    [ContestEvents.TestStarted]: {} as { test: ITest },
    [ContestEvents.TestEnded]: {} as { test: ITest, status: TestStatus },
    [ContestEvents.TestSuiteStarted]: {} as { testSuite: ITestSuite<unknown> },
    [ContestEvents.TestSuiteEnded]: {} as { testSuite: ITestSuite<unknown>, status: TestSuiteStatus },
} satisfies EventPayloadMap<ContestEvents>;

export type PayloadByEvent = typeof payloadByEvent;
