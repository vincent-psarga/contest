import { NoOpListener } from "../events/NoOpListener";
import type { ITest } from "../../../domain/models/ITest";
import {
  ContestEvents,
  type PayloadByEvent,
} from "../../../domain/services/events/ContestEvents";
import { StatusEnum } from "../../../domain/models/TestStatus";
import type { ILogger } from "../../../domain/services/ILogger";

export abstract class AbstractReporter extends NoOpListener {
  private readonly failures: { test: ITest; error: Error }[] = [];
  private testCount = 0;

  protected constructor(protected readonly logger: ILogger) {
    super();
  }

  onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
    this.testCount++;

    if (payload.status.status === StatusEnum.fail) {
      this.failures.push({ test: payload.test, error: payload.status.error });
    }
  }

  onTestRunEnded(payload: PayloadByEvent[ContestEvents.TestRunEnded]) {
    this.logger.log("");
    this.logger.log(
      `${this.testCount} executed - ${this.failures.length} failed`,
    );

    for (const failure of this.failures) {
      this.logger.log(failure.test.name);
      this.logger.error(failure.error);
      this.logger.log("");
    }
  }
}
