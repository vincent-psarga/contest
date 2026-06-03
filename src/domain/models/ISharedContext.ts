import type {IContext} from "./IContext";

export interface ISharedContext<T> {
    setup: (context: IContext<T>) => void
}
