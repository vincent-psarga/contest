import type {Context} from "../../application/dsl/Context";
import type {ITestSuite} from "../models/ITestSuite";
import type {IContext} from "../models/IContext";

export interface ITestContextRegistry {
    get<T, K extends keyof T>(key: K, context: IContext<T>): T[K]
    set<T, K extends keyof T>(key: K, value: T[K], context: IContext<T>): void

    getContext<T>(testSuiteId: ITestSuite['id']): Context<T>
    withAncestors(ancestors: ITestSuite[], callback: () => Promise<void>): Promise<void>
}
