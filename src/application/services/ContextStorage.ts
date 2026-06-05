import type {Callbackable, IContext} from "../../domain/models/IContext";
import {v4 as uuidv4} from "uuid";
import {ContextNotSetError} from "../../domain/errors/ContextNotSetError";

export class ContextStorage<T> implements IContext<T> {
    public readonly id = uuidv4();
    private readonly storage = new Map<string, unknown>();
    private readonly callbackStorage = new Map<string, () => unknown>();
    private readonly _keys: (keyof T)[] = [];

    get<K extends keyof T>(key: K): T[K] {
        if (!this._keys.includes(key)) {
            throw new ContextNotSetError(String(key));
        }

        if (this.storage.has(String(key))) {
            return this.storage.get(String(key)) as T[K];
        }

        const callback = this.callbackStorage.get(String(key));
        if (!callback) {
            throw new ContextNotSetError(String(key));
        }

        const computedValue = callback() as T[K];
        this.storage.set(String(key), computedValue);
        return computedValue;
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
        throw new Error('when() can not be used on ContextStorage')
    }

    with() {
        throw new Error('with() can not be used on ContextStorage')
    }


    get keys(): (keyof T) [] {
        return this._keys;
    }
}
