import type {ITestRunner} from "../../domain/services/ITestRunner";
import type {ITest} from "../../domain/models/ITest";
import type {ITestSuite} from "../../domain/models/ITestSuite";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import {ContestEvents} from "../../domain/services/events/ContestEvents";
import {StatusEnum, type TestStatus} from "../models/TestStatus";

export class TestRunner implements ITestRunner {
    constructor(
        private readonly eventBus: IEventBus,
    ) {}

    async runTest(test: ITest) {
        await this.eventBus.emit(ContestEvents.TestStarted, { test })
        let status: TestStatus;

        try {
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

    async runTestSuite<T>(testSuite: ITestSuite<T>) {
        await this.eventBus.emit(ContestEvents.TestSuiteStarted, { testSuite })
        let status: TestStatus | undefined = undefined;

        for (const subSuite of testSuite.testSuites) {
            status = this.updateTestStatus(status, await this.runTestSuite(subSuite));
        }

        for (const test of testSuite.tests) {
            status = this.updateTestStatus(status, await this.runTest(test));
        }

        status ??= { status: StatusEnum.notRun }

        await this.eventBus.emit(ContestEvents.TestSuiteEnded, { testSuite, status});

        return status;
    }

    async runTestSuites<T>(testSuites: ITestSuite<T>[]) {
        let status: TestStatus | undefined = undefined;

        for (const testSuite of testSuites) {
            status = this.updateTestStatus(status, await this.runTestSuite(testSuite));
        }

        return status ?? { status: StatusEnum.notRun };
    }

    private updateTestStatus(current: TestStatus | undefined, newTestStatus: TestStatus): TestStatus {
        if (!current || newTestStatus.status === StatusEnum.fail) { return newTestStatus }

        return current;
    }
}
