import type {ITestSuite} from "../models/ITestSuite";

export interface ITestLoader {
    load(workingDirectory: string): Promise<ITestSuite<unknown>[]>;
}
