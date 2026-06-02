import type {Context} from "../../application/dsl/Context";
import type {ITestSuite} from "../models/ITestSuite";
import type {IContext} from "../models/IContext";

export interface ITestContextRegistry {
    get<K, V, T>(key: K, context: IContext<T>): V
    set<K, V, T>(key: K, value: V, context: IContext<T>): void

    getContext<T>(testSuiteId: ITestSuite['id']): Context<T>
    withAncestors(ancestors: ITestSuite[], callback: () => Promise<void>): Promise<void>
}
