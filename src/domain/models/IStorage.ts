export type Callbackable<T> = T | (() => T)

export interface IStorage<T> {
    get<K extends keyof T>(key: K): T[K];
    set<K extends keyof T>(key: K, value: Callbackable<T[K]>): void;
}
