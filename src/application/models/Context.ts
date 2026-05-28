import type {IContext} from "../../domain/models/IContext";

export class Context<T> implements IContext<T> {
    get<K extends keyof T>(key: K): T[K] {
        throw new Error("Method not implemented.");
    }
    set<K extends keyof T>(key: K, value: T[K]): void {
        throw new Error("Method not implemented.");
    }

}
