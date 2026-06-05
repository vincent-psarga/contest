import {type ITestContainer, TestContainerType} from "./ITestContainer";

export interface ITestFile extends ITestContainer {
    type: TestContainerType.TestFile;
    path: string;
}

export function isITestFile(tbd: ITestContainer): tbd is ITestFile {
    return tbd.type === TestContainerType.TestFile;
}
