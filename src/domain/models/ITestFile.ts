import { type ITestContainer } from "./ITestContainer";
import { respondsWith } from "../utils/respondsWith";

export interface ITestFile extends ITestContainer {
  path: string;

  isITestFile(): boolean;
}

export function isITestFile(tbd: ITestContainer): tbd is ITestFile {
  return respondsWith(tbd as ITestFile, "isITestFile", true);
}
