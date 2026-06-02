export type Callbackable<T> = T | (() => T)

export interface IContext<T> {
    id: string;
    get<K extends keyof T>(key: K): T[K];
    set<K extends keyof T>(key: K, value: Callbackable<T[K]>): void;
}
