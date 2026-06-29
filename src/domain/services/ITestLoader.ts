import type { ITestContainer } from "../models/ITestContainer";

export type TestLoadOptions = {
  excludes: string[];
  includes: string[];
};

export interface ITestLoader {
  load(
    workingDirectory: string,
    opts: TestLoadOptions,
  ): Promise<ITestContainer[]>;
}
