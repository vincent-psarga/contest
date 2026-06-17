import {ContestEvents, type PayloadByEvent} from "../../../domain/services/events/ContestEvents";
import {StatusEnum} from "../../../domain/models/TestStatus";
import {AbstractReporter} from "./AbstractReporter";
import type {ILogger} from "../../../domain/services/ILogger";

export class TreeReporter extends AbstractReporter {
    private indentation = 0;

    constructor(
        logger: ILogger
    ) {
        super(logger);
    }

    onTestFileStarted(payload: PayloadByEvent[ContestEvents.TestFileStarted]) {
        this.logger.log(`${this.indent()} ${payload.testFile.path}`)
        this.indentation++
    }

    onTestFileEnded(): void {
        this.logger.log('')
        this.indentation--
    }

    onTestSuiteStarted(payload: PayloadByEvent[ContestEvents.TestSuiteStarted]): void {
        this.logger.log(`${this.indent()} ${payload.testSuite.name}`)
        this.indentation++
    }

    onTestSuiteEnded(): void {
        this.indentation--
    }

    onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
        super.onTestEnded(payload);

        switch(payload.status.status) {
            case StatusEnum.ok:
                this.logger.log(`${this.indent()}  ${this.logger.typo.success('✓')} ${payload.test.name}`);
                return;
            case StatusEnum.fail:
                this.logger.log(`${this.indent()}  ${this.logger.typo.error('⨯')} ${payload.test.name}`);
                return;
            case StatusEnum.notRun:
                this.logger.log(`${this.indent()}  ${this.logger.typo.faded('-')} ${payload.test.name}`);
                return;
        }
    }

    private indent(): string {
        return Array.from(new Array(this.indentation)).map(() => '  ').join('')
    }
}
