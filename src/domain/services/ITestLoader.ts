import type { ITestContainer } from "../models/ITestContainer";

export interface ITestLoader {
  load(workingDirectory: string): Promise<ITestContainer[]>;
}
