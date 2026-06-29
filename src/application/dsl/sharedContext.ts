import type { IContext } from "../../domain/models/IContext";
import type { ISharedContext } from "../../domain/models/ISharedContext";
import { SharedContext } from "../models/SharedContext";

export function sharedContext<T>(
  name: string,
  setup: (context: IContext<T>) => void,
): ISharedContext<T> {
  return new SharedContext(name, setup);
}

export type SharedContextType<T extends ISharedContext<T>> = T;
