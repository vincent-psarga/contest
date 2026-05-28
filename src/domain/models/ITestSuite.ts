import type {IContext} from "./IContext";
import type {ITest} from "./ITest";

export interface ITestSuite<T> {
    name: string;
    testSuites: ITestSuite<unknown>[];
    tests: ITest[];
    context: IContext<T>;

    addTestSuite: (testSuite: ITestSuite<unknown>) => void;
    addTest: (test: ITest) =>  void;
}
