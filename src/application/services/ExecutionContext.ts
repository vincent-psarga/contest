import type {Callbackable, IContext} from "../../domain/models/IContext";
import {v4 as uuidv4} from "uuid";
import {ContextStorage} from "./ContextStorage";
import {ContextSetInTestLoop} from "../../domain/errors/ContextSetInTestLoop";

export class ExecutionContext<T> implements IContext<T> {
    public readonly id = uuidv4();
    private readonly contextStorage: ContextStorage<T>;

    constructor(
        contextStorages: ContextStorage<T>[]
    ) {
        this.contextStorage = new ContextStorage<T>();
        for (const storage of contextStorages) {
            for (const key of storage.keys) {
                this.contextStorage.set(key, () => storage.get(key));
            }
        }
    }

    get<K extends keyof T>(key: K): T[K] {
        return this.contextStorage.get(key);
    }

    set<K extends keyof T>(key: K, value: Callbackable<T[K]>): void {
        throw new ContextSetInTestLoop()
    }
}
