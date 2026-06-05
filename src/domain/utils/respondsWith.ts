import {respondsTo} from "./respondsTo";

type MethodKeys<T> = {
    [K in keyof T]: T[K] extends Function ? K : never
}[keyof T];

export function respondsWith<
    T,
    K extends MethodKeys<T>,
    F extends T[K] & ((...args: any[]) => any)
>(tbd: T, fn: K, value: ReturnType<F>): tbd is T {
    if (!respondsTo<{ [fn]: () => unknown }>(tbd, String(fn))) return false;

    try {
        return (tbd[fn] as () => unknown)() === value;
    } catch {
        return false;
    }
}
