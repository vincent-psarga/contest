import type {Callbackable, IStorage} from "../../domain/models/IStorage";
import {ContextNotSetError} from "../../domain/errors/ContextNotSetError";

type Callbacked<T> = {
    [K in keyof T]: () => T[K];
};

export class Storage<T> implements IStorage<T> {
    private readonly storage: T = {} as T;
    private readonly callbacks: Callbacked<T> = {} as Callbacked<T>;
    private readonly _keys = new Set<keyof T>();
    private readonly computedKeys = new Set<keyof T>();

    get<K extends keyof T>(key: K): T[K] {
        if (!this._keys.has(key)) {
            throw new ContextNotSetError(String(key));
        }

        if (this.computedKeys.has(key)) {
            return this.storage[key];
        }

        const computedValue = this.callbacks[key]();
        this.computedKeys.add(key);
        this.storage[key] = computedValue;
        return computedValue;
    }

    set<K extends keyof T>(key: K, value: Callbackable<T[K]>): void {
        this._keys.add(key);

        if (typeof value === 'function') {
            this.callbacks[key] = value as () => T[K];
        } else {
            this.callbacks[key] = () => value;
        }
    }

    get keys() {
        return this._keys.keys()
    }
}
