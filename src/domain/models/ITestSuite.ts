import type {ITest} from "./ITest";
import type {TestBody} from "./TestBody";

export enum Hooks {
    beforeEach = 'beforeEach',
}

export interface ITestSuite {
    id: string;
    name: string;
    testSuites: ITestSuite[];
    tests: ITest[];
    hooks: Partial<Record<Hooks, TestBody>>;

    addHook: (hook: Hooks, body: TestBody) => void;
    addTestSuite: (testSuite: ITestSuite) => void;
    addTest: (test: ITest) =>  void;
}
