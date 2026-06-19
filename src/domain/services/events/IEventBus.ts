import { ContestEvents, type PayloadByEvent } from "./ContestEvents";
import type { IEventListener } from "./IEventListener";

export interface IEventBus {
  addListener: (listener: IEventListener) => void;

  emit<K extends ContestEvents>(event: K, payload: PayloadByEvent[K]): void;
}
