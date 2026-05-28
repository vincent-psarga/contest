import type {ITestSuite} from "../../domain/models/ITestSuite";
import {Context} from "./Context";
import type {ITest} from "../../domain/models/ITest";

export class TestSuite<T> implements ITestSuite<T> {
    private readonly _testSuites: ITestSuite<unknown>[] = [];
    private readonly _context = new Context<T>();
    private readonly _tests: ITest[] = [];

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

    get context() {
        return this._context;
    }

    addTestSuite(testSuite: ITestSuite<unknown>): void {
        this._testSuites.push(testSuite);
    }

    addTest(test: ITest): void {
        this._tests.push(test)
    }
}
