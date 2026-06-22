import type { ITestContainer } from "../models/ITestContainer";
import type { IContext } from "../models/IContext";

export interface ITestContextRegistry {
  get<T, K extends keyof T>(key: K): T[K];
  set<T, K extends keyof T>(key: K, value: T[K]): void;

  getContext<T>(testContainerId: ITestContainer["id"]): IContext<T>;
  withAncestors(
    ancestors: ITestContainer[],
    callback: () => Promise<void>,
  ): Promise<void>;
}
