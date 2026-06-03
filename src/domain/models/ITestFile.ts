import type {ITestContainer} from "./ITestContainer";

export interface ITestFile extends ITestContainer {
    path: string;
}

export function isITestFile(tbd: ITestContainer): tbd is ITestFile {
    return (tbd as unknown as {path: string}).path !== undefined;
}
