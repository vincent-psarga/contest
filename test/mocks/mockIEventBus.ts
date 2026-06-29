import type { IEventBus } from "../../src/domain/services/events/IEventBus";
import type { Mocked } from "jest-mock";
import { fn } from "jest-mock";

export function mockIEventBus(): Mocked<IEventBus> {
  return {
    addListener: fn(),
    emit: fn(),
  };
}
