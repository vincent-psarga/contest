import type { Context } from "../../application/dsl/Context";
import type { ITestContainer } from "../models/ITestContainer";

export interface ITestContextRegistry {
  get<T, K extends keyof T>(key: K): T[K];
  set<T, K extends keyof T>(key: K, value: T[K]): void;

  getContext<T>(testContainerId: ITestContainer["id"]): Context<T>;
  withAncestors(
    ancestors: ITestContainer[],
    callback: () => Promise<void>,
  ): Promise<void>;
}
