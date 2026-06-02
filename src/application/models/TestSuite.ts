import {Hooks, type ITestSuite} from "../../domain/models/ITestSuite";
import type {ITest} from "../../domain/models/ITest";
import type {TestBody} from "../../domain/models/TestBody";
import { v4 as uuidv4 } from "uuid";

export class TestSuite implements ITestSuite {
    private readonly _testSuites: ITestSuite[] = [];
    private readonly _tests: ITest[] = [];
    private readonly _hooks: Partial<Record<Hooks, TestBody>> = {}
    public readonly id = uuidv4();

    constructor(
        private readonly _name: string
    ) {}

    get name() {
        return this._name;
    }

    get testSuites() {
        return this._testSuites;
    }

    get tests() {
        return this._tests;
    }

    get hooks() {
        return this._hooks;
    }

    addHook(hook: Hooks, body: TestBody) {
        this._hooks[hook] = body;
    }

    addTestSuite(testSuite: ITestSuite): void {
        this._testSuites.push(testSuite);
    }

    addTest(test: ITest): void {
        this._tests.push(test)
    }
}
