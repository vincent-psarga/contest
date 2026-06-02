import {ContestEvents, type PayloadByEvent} from "../../../domain/services/events/ContestEvents";
import {StatusEnum} from "../../../domain/models/TestStatus";
import {AbstractReporter} from "./AbstractReporter";

export class DotReporter extends AbstractReporter {
    onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
        super.onTestEnded(payload);

        switch(payload.status.status) {
            case StatusEnum.ok:
                process.stdout.write('.')
                return;
            case StatusEnum.fail:
                process.stdout.write('x')
                return;
        }
    }
}
