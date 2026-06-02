import type {Callbackable, IContext} from "../../domain/models/IContext";
import {v4 as uuidv4} from "uuid";
import {ContextNotSetError} from "../../domain/errors/ContextNotSetError";

export class ContextStorage<T> implements IContext<T> {
    public readonly id = uuidv4();
    private readonly storage = new Map<string, unknown>();
    private readonly callbackStorage = new Map<string, () => unknown>();
    private readonly _keys: (keyof T)[] = [];

    get<K extends keyof T>(key: K): T[K] {
        const value = this.storage.get(String(key)) as T[K];
        if (!value) {
            const callback = this.callbackStorage.get(String(key));
            if (!callback) {
                throw new ContextNotSetError(String(key));
            }

            const computedValue = callback() as T[K];
            this.storage.set(String(key), computedValue);
            return computedValue;
        }

        return value;
    }

    set<K extends keyof T>(key: K, value: Callbackable<T[K]>): void {
        this._keys.push(key);

        if (typeof value === 'function') {
            this.callbackStorage.set(String(key), value as () => T[K]);
        } else {
            this.storage.set(String(key), value);
        }
    }

    when() {
        throw new Error('When can not be used on ContextStorage')
    }

    get keys(): (keyof T) [] {
        return this._keys;
    }
}
