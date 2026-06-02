import type {IEventBus} from "../../../domain/services/events/IEventBus";
import type {ContestEvents,PayloadByEvent} from "../../../domain/services/events/ContestEvents";
import type {IEventListener} from "../../../domain/services/events/IEventListener";

export class EventBus implements IEventBus {
    private readonly listeners: IEventListener[] = []

    addListener(listener: IEventListener): void {
        this.listeners.push(listener);
    }

    emit<K extends ContestEvents>(event: K, payload:PayloadByEvent[K]): void {
        for (const listener of this.listeners) {
            const callback = listener[`on${event}`]
            assertCallbackType<PayloadByEvent[K]>(callback);
            callback.bind(listener)(payload);
        }
    }
}

function assertCallbackType<T>(cb: unknown): asserts cb is (payload: T) => Promise<void> {
    // Cheating typechecking a bit here.
}
