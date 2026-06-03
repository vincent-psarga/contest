import type {TestBody} from "./TestBody";
import type {ITestContainer} from "./ITestContainer";

export enum Hooks {
    beforeEach = 'beforeEach',
}

export interface ITestSuite extends ITestContainer{
    name: string;
    hooks: Partial<Record<Hooks, TestBody>>;
    addHook: (hook: Hooks, body: TestBody) => void;
}

export function isITestSuite(tbd: ITestContainer): tbd is ITestSuite {
    return (tbd as unknown as {name: string}).name !== undefined;
}
