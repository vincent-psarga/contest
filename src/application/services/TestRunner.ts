import type {ITestRunner} from "../../domain/services/ITestRunner";
import type {ITest} from "../../domain/models/ITest";
import {isITestSuite} from "../../domain/models/ITestSuite";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import {ContestEvents} from "../../domain/services/events/ContestEvents";
import {StatusEnum, type TestStatus} from "../../domain/models/TestStatus";
import type {TestSuiteStatus} from "../../domain/models/TestSuiteStatus";
import type {ITestContextRegistry} from "../../domain/services/ITestContextRegistry";
import type {ITestContainer} from "../../domain/models/ITestContainer";
import {isITestFile} from "../../domain/models/ITestFile";
import {TimeoutExceededError} from "../../domain/errors/TimeoutExceededError";
import type {TestPlan, TestPlanEntry} from "../../domain/models/ITestPlan";

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

    async runTestContainers(testContainers: ITestContainer[]) {
        const testPlan = this.buildTestPlan(testContainers, [], false, false, this.timeout);
        let status: TestSuiteStatus | undefined = undefined;

        const onlyTests = testPlan.filter(plan => plan.only);

        const tests = onlyTests.length > 0 ? onlyTests : testPlan;

        for (const testPlanEntry of tests) {
            //status = this.updateTestSuiteStatus(status, await this.runTest(testPlanEntry.test, testPlanEntry.ancestors));
            status = this.updateTestSuiteStatus(status, await this.runTestPlanEntry(testPlanEntry));
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

    private emitContainerStartEvent(testContainer: ITestContainer) {
        if (isITestSuite(testContainer)) {
            return this.eventBus.emit(ContestEvents.TestSuiteStarted, { testSuite: testContainer })
        }

        if (isITestFile(testContainer)) {
            return this.eventBus.emit(ContestEvents.TestFileStarted, { testFile: testContainer })
        }
    }

    private emitContainerEndEvent(testContainer: ITestContainer, status: TestSuiteStatus) {
        if (isITestSuite(testContainer)) {
            return this.eventBus.emit(ContestEvents.TestSuiteEnded, {testSuite: testContainer, status});
        }

        if (isITestFile(testContainer)) {
            return this.eventBus.emit(ContestEvents.TestFileEnded, { testFile: testContainer, status })
        }
    }

    private buildTestPlan(testContainers: ITestContainer[], ancestors: ITestContainer[], only: boolean, skip: boolean, timeout: number): TestPlan {
        return testContainers.reduce((testPlan, container) => {
            for (const test of container.tests) {
                testPlan.push({
                    test,
                    ancestors: [...ancestors, container],
                    only: only || container.only || test.only,
                    skip: skip || container.skip || test.skip,
                    timeout: test.timeout ?? container.timeout ?? timeout,
                });
            }

            return [
                ...testPlan,
                ...this.buildTestPlan(
                    container.testContainers,
                    [...ancestors, container],
                    only || container.only,
                    skip || container.skip,
                    container.timeout ?? timeout
                ),
            ]
        }, [] as TestPlan);
    }
}

function isTestStatus(tbd: TestStatus | TestSuiteStatus): tbd is TestStatus {
    const ts = tbd as TestStatus;

    return (ts.status === StatusEnum.fail && ts.error !== undefined);
}
