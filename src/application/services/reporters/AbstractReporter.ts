import {NoOpListener} from "../events/NoOpListener";
import type {ITest} from "../../../domain/models/ITest";
import {ContestEvents, type PayloadByEvent} from "../../../domain/services/events/ContestEvents";
import {StatusEnum} from "../../../domain/models/TestStatus";

export abstract class AbstractReporter extends NoOpListener {
    private readonly failures: {test: ITest, error: Error}[] = [];
    private testCount = 0;

    onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
        this.testCount++;

        if (payload.status.status === StatusEnum.fail) {
            this.failures.push({test: payload.test, error: payload.status.error});
        }
    }

    onTestRunEnded(payload: PayloadByEvent[ContestEvents.TestRunEnded]) {
        console.log('')
        console.log(`${this.testCount} executed - ${this.failures.length} failed`);

        for (const failure of this.failures) {
            console.log(failure.test.name);
            console.error(failure.error);
            console.log('')
        }
    }
}
