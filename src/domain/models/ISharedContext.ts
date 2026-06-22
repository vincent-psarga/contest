import type { IContext } from "./IContext";
import { type ITestContainer } from "./ITestContainer";
import { respondsWith } from "../utils/respondsWith";

export interface ISharedContext<T> extends ITestContainer {
  name: string;
  setup: (context: IContext<T>) => void;
  register<U>(tests: (context: IContext<T & U>) => void): void;
  extends<U>(
    name: string,
    setup: (context: IContext<T & U>) => void,
  ): ISharedContext<T & U>;
  isISharedContext(): boolean;
}

export function isISharedContext<T>(
  tbd: ITestContainer,
): tbd is ISharedContext<T> {
  return respondsWith(tbd as ISharedContext<T>, "isISharedContext", true);
}
