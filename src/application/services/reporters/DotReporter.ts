import {NoOpListener} from "../events/NoOpListener";
import {ContestEvents, type PayloadByEvent} from "../../../domain/services/events/ContestEvents";
import {StatusEnum} from "../../../domain/models/TestStatus";
import type {ITest} from "../../../domain/models/ITest";

export class DotReporter extends NoOpListener {
    private readonly failures: {test: ITest, error: Error}[] = [];
    private testCount = 0;

    onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
        this.testCount++;

        switch(payload.status.status) {
            case StatusEnum.ok:
                process.stdout.write('.')
                return;
            case StatusEnum.fail:
                this.failures.push({test: payload.test, error: payload.status.error});
                process.stdout.write('x')
                return;
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
