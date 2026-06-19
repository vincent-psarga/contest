import type { ISharedContext } from "./ISharedContext";
import type { IStorage } from "./IStorage";

export interface IContext<T> extends IStorage<T> {
  id: string;
  when(ctx: Partial<T>, callback: () => void): void;
  when(description: string, ctx: Partial<T>, callback: () => void): void;
  with<U>(
    sharedContext: ISharedContext<U>,
    tests: (context: IContext<T & U>) => void,
  ): void;
}
