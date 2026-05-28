import {type PayloadByEvent} from "./ContestEvents";

type EventHandlers = {
    [K in keyof PayloadByEvent as `on${K}`]:
      (payload: PayloadByEvent[K]) => Promise<void>;
};

export interface IEventListener extends EventHandlers {}
