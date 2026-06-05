import type {TestBody} from "./TestBody";
import {type ITestContainer, TestContainerType} from "./ITestContainer";

export enum Hooks {
    beforeEach = 'beforeEach',
}

export interface ITestSuite extends ITestContainer {
    type: TestContainerType.TestSuite;
    name: string;
    hooks: Partial<Record<Hooks, TestBody>>;
    addHook: (hook: Hooks, body: TestBody) => void;
}

export function isITestSuite(tbd: ITestContainer): tbd is ITestSuite {
    return tbd.type === TestContainerType.TestSuite;
}
