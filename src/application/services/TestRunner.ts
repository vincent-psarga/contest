import type {ITestRunner} from "../../domain/services/ITestRunner";
import type {ITest} from "../../domain/models/ITest";
import type {ITestSuite} from "../../domain/models/ITestSuite";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import {ContestEvents} from "../../domain/services/events/ContestEvents";
import {StatusEnum, type TestStatus} from "../../domain/models/TestStatus";
import type {TestSuiteStatus} from "../../domain/models/TestSuiteStatus";

export class TestRunner implements ITestRunner {
    constructor(
        private readonly eventBus: IEventBus,
    ) {}

    async runTest(test: ITest, ancestors: ITestSuite<unknown>[]) {
        await this.eventBus.emit(ContestEvents.TestStarted, { test })
        let status: TestStatus;

        try {
            for (const ancestor of ancestors) {
                if (ancestor.hooks?.beforeEach) {
                    ancestor.hooks.beforeEach();
                }
            }

            await test.body();
            status = { status: StatusEnum.ok}
        } catch (err) {
            status = {
                status: StatusEnum.fail,
                error: err instanceof Error ? err : new Error(String(err))
            }
        }


        await this.eventBus.emit(ContestEvents.TestEnded, { test, status });
        return status;
    }

    async runTestSuite<T>(testSuite: ITestSuite<T>, ancestors: ITestSuite<T>[]) {
        await this.eventBus.emit(ContestEvents.TestSuiteStarted, { testSuite })
        let status: TestSuiteStatus | undefined = undefined;

        for (const subSuite of testSuite.testSuites) {
            status = this.updateTestSuiteStatus(status, await this.runTestSuite(subSuite, [...ancestors, testSuite]));
        }

        for (const test of testSuite.tests) {
            status = this.updateTestSuiteStatus(status, await this.runTest(test, [...ancestors, testSuite]));
        }

        status ??= { status: StatusEnum.notRun }

        await this.eventBus.emit(ContestEvents.TestSuiteEnded, { testSuite, status});

        return status;
    }

    async runTestSuites<T>(testSuites: ITestSuite<T>[]) {
        let status: TestSuiteStatus | undefined = undefined;

        for (const testSuite of testSuites) {
            status = this.updateTestSuiteStatus(status, await this.runTestSuite(testSuite, []));
        }

        return status ?? { status: StatusEnum.notRun };
    }

    private updateTestSuiteStatus(current: TestSuiteStatus | undefined, newTestStatus: TestStatus | TestSuiteStatus): TestSuiteStatus {
        if (!current) {
            if (newTestStatus.status === StatusEnum.fail) {
                return {
                    status: newTestStatus.status,
                    errors: isTestStatus(newTestStatus) ? [newTestStatus.error] : newTestStatus.errors,
                }
            }
            return { status: newTestStatus.status }
        }


        if (newTestStatus.status === StatusEnum.fail) {
            return {
                status: StatusEnum.fail,
                errors: [
                    ...(current.status === StatusEnum.fail ? current.errors : []),
                    ...(isTestStatus(newTestStatus) ? [newTestStatus.error] : newTestStatus.errors)
                ],
            }
        }

        return current;
    }
}

function isTestStatus(tbd: TestStatus | TestSuiteStatus): tbd is TestStatus {
    const ts = tbd as TestStatus;

    return (ts.status === StatusEnum.fail && ts.error !== undefined);
}
