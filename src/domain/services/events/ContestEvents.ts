import type { ITest } from "../../models/ITest";
import type {ITestSuite} from "../../models/ITestSuite";
import type {TestStatus} from "../../../application/models/TestStatus";

export enum ContestEvents {
    TestFileLoaded = "TestFileLoaded",
    TestSuiteLoaded = 'TestSuiteLoaded',
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
    [ContestEvents.TestLoaded]: {} as { test: ITest, testSuite: ITestSuite<unknown> },
    [ContestEvents.TestStarted]: {} as { test: ITest },
    [ContestEvents.TestEnded]: {} as { test: ITest, status: TestStatus },
    [ContestEvents.TestSuiteStarted]: {} as { testSuite: ITestSuite<unknown> },
    [ContestEvents.TestSuiteEnded]: {} as { testSuite: ITestSuite<unknown>, status: TestStatus },
} satisfies EventPayloadMap<ContestEvents>;

export type PayloadByEvent = typeof payloadByEvent;
