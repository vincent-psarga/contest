import type { IEventListener } from "../../../domain/services/events/IEventListener";
import {
  ContestEvents,
  type PayloadByEvent,
} from "../../../domain/services/events/ContestEvents";

export class NoOpListener implements IEventListener {
  onTestFileLoaded(payload: PayloadByEvent[ContestEvents.TestFileLoaded]) {}

  onTestSuiteLoaded(payload: PayloadByEvent[ContestEvents.TestSuiteLoaded]) {}

  onHookRegistered(payload: PayloadByEvent[ContestEvents.HookRegistered]) {}

  onTestLoaded(payload: PayloadByEvent[ContestEvents.TestLoaded]) {}

  onTestStarted(payload: PayloadByEvent[ContestEvents.TestStarted]) {}

  onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {}

  onTestSuiteStarted(payload: PayloadByEvent[ContestEvents.TestSuiteStarted]) {}

  onTestSuiteEnded(payload: PayloadByEvent[ContestEvents.TestSuiteEnded]) {}

  onTestRunStarted(payload: PayloadByEvent[ContestEvents.TestRunStarted]) {}

  onTestRunEnded(payload: PayloadByEvent[ContestEvents.TestRunEnded]) {}

  onTestFileStarted(
    payload: PayloadByEvent[ContestEvents.TestFileStarted],
  ): void {}

  onTestFileEnded(payload: PayloadByEvent[ContestEvents.TestFileEnded]): void {}
}
