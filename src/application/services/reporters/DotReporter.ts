import {ContestEvents, type PayloadByEvent} from "../../../domain/services/events/ContestEvents";
import {StatusEnum} from "../../../domain/models/TestStatus";
import {AbstractReporter} from "./AbstractReporter";
import type {ILogger} from "../../../domain/services/ILogger";

export class DotReporter extends AbstractReporter {
    constructor(
        logger: ILogger
    ) {
        super(logger);
    }

    onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
        super.onTestEnded(payload);

        switch(payload.status.status) {
            case StatusEnum.ok:
                this.logger.write(this.logger.typo.success('.'))
                return;
            case StatusEnum.fail:
                this.logger.write(this.logger.typo.error('x'), 'stderr')
                return;
            case StatusEnum.notRun:
                this.logger.write(this.logger.typo.faded('-'))
                return;
        }
    }
}
