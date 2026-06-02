import type {ITestRegistry} from "../../domain/services/ITestRegistry";
import type {Hooks, ITestSuite} from "../../domain/models/ITestSuite";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import {ContestEvents} from "../../domain/services/events/ContestEvents";
import type {ITest} from "../../domain/models/ITest";
import type {TestBody} from "../../domain/models/TestBody";

export class TestRegistry implements ITestRegistry {
    private readonly _testSuites: ITestSuite[] = [];
    private readonly _ancestorStack: (ITestSuite | null)[] = [];
    private _currentTestSuite: ITestSuite | null = null;

    constructor(
        private readonly eventBus: IEventBus,
    ) {
    }

    get testSuites() {
        return this._testSuites;
    }

    get currentTestSuite(): ITestSuite | null {
        return this._currentTestSuite;
    }

    registerTestSuite(testSuite: ITestSuite, callback: () => void): void {
        this.beginSuite(testSuite);
        try {
            callback();
        } finally {
            this.endSuite();
        }
    }

    beginSuite(testSuite: ITestSuite): void {
        const previous = this._currentTestSuite;
        if (previous === null) {
            this._testSuites.push(testSuite);
        } else {
            previous.addTestSuite(testSuite);
        }
        this._ancestorStack.push(previous);
        this._currentTestSuite = testSuite;
    }

    endSuite(): void {
        const ending = this._currentTestSuite;
        const previous = this._ancestorStack.pop() ?? null;
        this._currentTestSuite = previous;
        if (ending) {
            this.eventBus.emit(ContestEvents.TestSuiteLoaded, { testSuite: ending, container: previous });
        }
    }

    registerHook(hook: Hooks, body: TestBody): void {
        if (!this._currentTestSuite) {
            throw new Error(`Unable to register hook ${hook} - no current test suite`);
        }
        this._currentTestSuite.addHook(hook, body);
        this.eventBus.emit(ContestEvents.HookRegistered, { hook, testSuite: this._currentTestSuite });
    }

    registerTest(test: ITest): void {
        if (!this._currentTestSuite) {
            throw new Error(`Unable to register test "${test.name} - no current test suite`)
        }
        this._currentTestSuite.addTest(test);
    }
}
