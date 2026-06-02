import type {IContext} from "../../domain/models/IContext";
import { v4 as uuidv4 } from "uuid";
import type {ITestContextRegistry} from "../../domain/services/ITestContextRegistry";

export class Context<T> implements IContext<T> {
    public readonly id = uuidv4()

    constructor(
        private readonly testContextRegistry: ITestContextRegistry
    ) {}

    get<K extends keyof T>(key: K): T[K] {
        return this.testContextRegistry.get(key);
    }

    set<K extends keyof T>(key: K, value: T[K]): void {
        return this.testContextRegistry.set(key, value);
    }
}
