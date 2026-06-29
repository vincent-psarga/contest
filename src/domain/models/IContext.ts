import type { ISharedContext } from "./ISharedContext";
import type { IStorage } from "./IStorage";

export type Callbackable<T> = {
  [K in keyof T]: T[K] | (() => T[K]);
};

export interface IContext<T> extends IStorage<T> {
  id: string;
  when(ctx: Partial<Callbackable<T>>, callback: () => void): void;
  when(
    description: string,
    ctx: Partial<Callbackable<T>>,
    callback: () => void,
  ): void;
  with<U>(
    sharedContext: ISharedContext<U>,
    tests: (context: IContext<T & U>) => void,
  ): void;
}
