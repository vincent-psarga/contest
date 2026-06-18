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
import {TimeoutError} from "../../domain/errors/TimeoutError";

export class TestRunner implements ITestRunner {
    constructor(
        private readonly eventBus: IEventBus,
        private readonly testContextRegistry: ITestContextRegistry,
        private readonly timeout: number
    ) {}

    async runTest(test: ITest, ancestors: ITestContainer[]) {
        this.eventBus.emit(ContestEvents.TestStarted, { test })
        const testTimeout = test.timeout ?? this.timeout;

        const timeoutPromise = new Promise<TestStatus>(resolve => setTimeout(() => {
            resolve ({
                status: StatusEnum.fail,
                error: new TimeoutError(test.name, testTimeout)}
            );
        }, testTimeout));

        const statusPromise = new Promise<TestStatus>((resolve, reject) => {
            try {
                if (test.skip || ancestors.some(ancestor => ancestor.skip)) {
                    resolve({ status: StatusEnum.notRun});
                } else {
                    this.testContextRegistry.withAncestors(ancestors, async() => {
                        for (const ancestor of ancestors) {
                            if (isITestSuite(ancestor) && ancestor.hooks?.beforeEach) {
                                await ancestor.hooks.beforeEach();
                            }
                        }

                        return test.body();
                    }).then(() => {
                        resolve({ status: StatusEnum.ok});
                    }).catch(err => {
                        resolve({
                            status: StatusEnum.fail,
                            error: err instanceof Error ? err : new Error(String(err))
                        })
                    })

                }
            } catch (err) {
                resolve({
                    status: StatusEnum.fail,
                    error: err instanceof Error ? err : new Error(String(err))
                });
            }
        });


        const status = await Promise.race([statusPromise, timeoutPromise]);

        this.eventBus.emit(ContestEvents.TestEnded, { test, status });
        return status;
    }

    async runTestContainers(testContainers: ITestContainer[]) {
        const testPlan = this.buildTestPlan(testContainers);
        let status: TestSuiteStatus | undefined = undefined;

        const onlyTests = testPlan.filter(plan => plan.only);

        const tests = onlyTests.length > 0 ? onlyTests : testPlan;

        for (const {test, ancestors } of tests) {
            status = this.updateTestSuiteStatus(status, await this.runTest(test, ancestors));
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

    private buildTestPlan(testContainers: ITestContainer[], ancestors: ITestContainer[] = [], only = false, skip = false): TestPlan {
        return testContainers.reduce((testPlan, container) => {
            for (const test of container.tests) {
                testPlan.push({
                    test,
                    ancestors: [...ancestors, container],
                    only: only || test.only,
                    skip: skip || test.skip,
                });
            }

            return [
                ...testPlan,
                ...this.buildTestPlan(
                    container.testContainers,
                    [...ancestors, container],
                    only || container.only,
                    skip || container.skip,
                ),
            ]
        }, [] as TestPlan);
    }
}

export type TestPlan  = {
  test: ITest,
  ancestors: ITestContainer[],
  only: boolean,
  skip: boolean,
}[]

function isTestStatus(tbd: TestStatus | TestSuiteStatus): tbd is TestStatus {
    const ts = tbd as TestStatus;

    return (ts.status === StatusEnum.fail && ts.error !== undefined);
}
