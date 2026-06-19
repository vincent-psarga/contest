import type {ITestRunner} from "../../domain/services/ITestRunner";
import {isITestSuite} from "../../domain/models/ITestSuite";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import {ContestEvents} from "../../domain/services/events/ContestEvents";
import {StatusEnum, type TestStatus} from "../../domain/models/TestStatus";
import type {TestSuiteStatus} from "../../domain/models/TestSuiteStatus";
import type {ITestContextRegistry} from "../../domain/services/ITestContextRegistry";
import {TimeoutExceededError} from "../../domain/errors/TimeoutExceededError";
import type {TestPlan, TestPlanEntry} from "../../domain/models/TestPlan";

export class TestRunner implements ITestRunner {
    constructor(
        private readonly eventBus: IEventBus,
        private readonly testContextRegistry: ITestContextRegistry,
        private readonly timeout: number
    ) {}

    async runTestPlanEntry(testPlanEntry: TestPlanEntry): Promise<TestStatus> {
        this.eventBus.emit(ContestEvents.TestStarted, { test: testPlanEntry.test })
        const status = await Promise.race([
            this.executeTestPlanEntry(testPlanEntry),
            this.getTimeoutPromise(testPlanEntry)
        ]);
        this.eventBus.emit(ContestEvents.TestEnded, { test: testPlanEntry.test, status });
        return status;
    }

    async runTestPlan(testPlan: TestPlan): Promise<TestSuiteStatus> {
        let status: TestSuiteStatus | undefined = undefined;

        for (const testPlanEntry of testPlan) {
            status = this.updateTestSuiteStatus(status, await this.runTestPlanEntry(testPlanEntry));
        }

        return status ?? { status: StatusEnum.notRun };
    }

    private async getTimeoutPromise(testPlanEntry: TestPlanEntry): Promise<TestStatus> {
        return new Promise<TestStatus>(resolve => setTimeout(() => {
            resolve({ status: StatusEnum.fail, error: new TimeoutExceededError(testPlanEntry.test.name, testPlanEntry.timeout)});
        }, testPlanEntry.timeout))
    }

    private async executeTestPlanEntry({ test, ancestors, skip }: TestPlanEntry): Promise<TestStatus> {
        if (skip) {
            return { status: StatusEnum.notRun }
        }

        try {
            await this.testContextRegistry.withAncestors(ancestors, async() => {
                for (const ancestor of ancestors) {
                    if (isITestSuite(ancestor) && ancestor.hooks.beforeEach) {
                        await ancestor.hooks.beforeEach()
                    }
                }

                return test.body();
            });

            return {
                status: StatusEnum.ok
            };
        } catch (err) {
            return {
                status: StatusEnum.fail,
                error: err instanceof Error ? err : new Error(String(err))
            };
        }
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
