import type {IContext} from "./IContext";
import type {ITest} from "./ITest";
import type {TestBody} from "./TestBody";

export enum Hooks {
    beforeEach = 'beforeEach',
}

export interface ITestSuite<T> {
    name: string;
    testSuites: ITestSuite<unknown>[];
    tests: ITest[];
    context: IContext<T>;
    hooks: Partial<Record<Hooks, TestBody>>;

    addHook: (hook: Hooks, body: TestBody) => void;
    addTestSuite: (testSuite: ITestSuite<unknown>) => void;
    addTest: (test: ITest) =>  void;
}
