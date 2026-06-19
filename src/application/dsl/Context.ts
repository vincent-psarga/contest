import type { IContext } from "../../domain/models/IContext";
import { v4 as uuidv4 } from "uuid";
import type { ITestContextRegistry } from "../../domain/services/ITestContextRegistry";
import { describe } from "./describe";
import type { ISharedContext } from "../../domain/models/ISharedContext";

type SimpleWhenArgs<T> = [context: Partial<T>, callback: () => void];
type WithTitleWhenArgs<T> = [
  description: string,
  context: Partial<T>,
  callback: () => void,
];

type WhenArgs<T> = WithTitleWhenArgs<T> | SimpleWhenArgs<T>;

export class Context<T> implements IContext<T> {
  public readonly id = uuidv4();

  constructor(private readonly testContextRegistry: ITestContextRegistry) {}

  get<K extends keyof T>(key: K): T[K] {
    return this.testContextRegistry.get(key);
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    return this.testContextRegistry.set(key, value);
  }

  when(...args: WhenArgs<T>) {
    const { description, context, callback } = this.getWhenParameters(...args);

    describe<T>(description, (ctx) => {
      for (const key of Object.keys(context)) {
        const value = context[key as keyof T];

        ctx.set(key as keyof T, value!);
      }

      callback();
    });
  }

  with<U>(
    sharedContext: ISharedContext<U>,
    tests: (context: IContext<T & U>) => void,
  ): void {
    sharedContext.register(tests);
  }

  private getWhenParameters(...args: WhenArgs<T>): {
    description: string;
    context: Partial<T>;
    callback: () => void;
  } {
    if (isWithTitleWhenArgs(args)) {
      const [description, context, callback] = args;
      return { description, context, callback };
    }

    const [context, callback] = args;

    const description = `when ${Object.entries(context)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(", ")}`;

    return { description, context, callback };
  }
}

function isWithTitleWhenArgs<T>(tbd: WhenArgs<T>): tbd is WithTitleWhenArgs<T> {
  return typeof tbd[0] === "string";
}
