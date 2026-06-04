import type { ISharedContext } from "./ISharedContext";

export type Callbackable<T> = T | (() => T)

export interface IContext<T> {
    id: string;
    get<K extends keyof T>(key: K): T[K];
    set<K extends keyof T>(key: K, value: Callbackable<T[K]>): void;
    when(ctx: Partial<T>, callback: () => void): void;
    when(description: string, ctx: Partial<T>, callback: () => void): void;
    with<U>(sharedContext: ISharedContext<U>, tests: (context: IContext<T & U>) => void): void;
}
