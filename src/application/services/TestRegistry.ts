import type {ITestRegistry} from "../../domain/services/ITestRegistry";
import type {ITestSuite} from "../../domain/models/ITestSuite";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import {ContestEvents} from "../../domain/services/events/ContestEvents";
import type {ITest} from "../../domain/models/ITest";

export class TestRegistry implements ITestRegistry {
    private readonly _testSuites: ITestSuite<unknown>[] = [];
    private currentTestSuite: ITestSuite<unknown> | null = null;

    constructor(
        private readonly eventBus: IEventBus,
    ) {}

    get testSuites() {
        return this._testSuites;
    }

    async registerTestSuite<T>(testSuite: ITestSuite<T>, callback: () => void | Promise<void>): Promise<void> {
        return this.saveCurrentSuite(async (currentTestSuite) => {
            if (currentTestSuite === null) {
                this.testSuites.push(testSuite);
            } else {
                currentTestSuite.addTestSuite(testSuite);
            }

            this.currentTestSuite = testSuite;

            await callback();
            await this.eventBus.emit(ContestEvents.TestSuiteLoaded, { testSuite, container: this.currentTestSuite })
        });
    }

    registerTest(test: ITest) {
        if (!this.currentTestSuite) {
            throw new Error(`Unable to register test "${test.name} - no current test suite`)
        }
        this.currentTestSuite.addTest(test);
    }

    private async saveCurrentSuite(callback: (currentTestSuite: ITestSuite<unknown> | null) => void | Promise<void>): Promise<void> {
        const current = this.currentTestSuite;
        try {
            await callback(current);
        } finally {
            this.currentTestSuite = current;
        }
    }
}
