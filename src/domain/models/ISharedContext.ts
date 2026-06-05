import type {IContext} from "./IContext";
import {type ITestContainer, TestContainerType} from "./ITestContainer";

export interface ISharedContext<T> extends ITestContainer {
    type: TestContainerType.SharedContext;
    name: string;
    setup: (context: IContext<T>) => void,
    register<U>(tests: (context: IContext<T & U>) => void): void
}

export function isISharedContext<T>(tbd: ITestContainer): tbd is ISharedContext<T> {
    return tbd.type === TestContainerType.SharedContext;
}
