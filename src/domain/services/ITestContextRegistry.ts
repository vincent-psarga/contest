import type {Context} from "../../application/dsl/Context";
import type {ITestSuite} from "../models/ITestSuite";

export interface ITestContextRegistry {
    get<T, K extends keyof T>(key: K): T[K]
    set<T, K extends keyof T>(key: K, value: T[K]): void

    getContext<T>(testSuiteId: ITestSuite['id']): Context<T>
    withAncestors(ancestors: ITestSuite[], callback: () => Promise<void>): Promise<void>
}
