import type {ITest} from "./ITest";

export enum TestContainerType {
    TestFile = "TestFile",
    TestSuite = "TestSuite",
    SharedContext = "SharedContext"
}

export interface ITestContainer {
    id: string;
    type: TestContainerType;

    testContainers: ITestContainer[];
    tests: ITest[];

    addTestContainer: (testContainer: ITestContainer) => void;
    addTest: (test: ITest) => void;
}
