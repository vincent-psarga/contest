import {type ITestContainer} from "../../domain/models/ITestContainer";
import {v4 as uuidv4} from "uuid";
import type {ITest} from "../../domain/models/ITest";

export abstract class AbstractTestContainer implements ITestContainer {
    public readonly id = uuidv4();

    public abstract only: boolean;
    public abstract skip: boolean;

    private readonly _tests: ITest[] = [];
    private readonly _testContainers: ITestContainer[] = [];

    get tests() {
        return this._tests;
    }

    get testContainers() {
        return this._testContainers;
    }

    addTestContainer(testContainer: ITestContainer) {
        this.testContainers.push(testContainer);
    }

    addTest(test: ITest) {
        this._tests.push(test);
    }
}
