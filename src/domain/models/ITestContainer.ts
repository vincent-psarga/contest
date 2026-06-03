import type {ITest} from "./ITest";

export interface ITestContainer {
    id: string;
    testContainers: ITestContainer[];
    tests: ITest[];

    addTestContainer: (testContainer: ITestContainer) => void;
    addTest: (test: ITest) => void;
}
