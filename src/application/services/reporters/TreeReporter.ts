import {ContestEvents, type PayloadByEvent} from "../../../domain/services/events/ContestEvents";
import {StatusEnum} from "../../../domain/models/TestStatus";
import {AbstractReporter} from "./AbstractReporter";

export class TreeReporter extends AbstractReporter {
    private indentation = 0;

    onTestFileStarted(payload: PayloadByEvent[ContestEvents.TestFileStarted]) {
        console.log(`${this.indent()} ${payload.testFile.path}`)
        this.indentation++
    }

    onTestFileEnded(): void {
        console.log('')
        this.indentation--
    }

    onTestSuiteStarted(payload: PayloadByEvent[ContestEvents.TestSuiteStarted]): void {
        console.log(`${this.indent()} ${payload.testSuite.name}`)
        this.indentation++
    }

    onTestSuiteEnded(): void {
        this.indentation--
    }

    onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
        super.onTestEnded(payload);

        switch(payload.status.status) {
            case StatusEnum.ok:
                console.log(`${this.indent()}  ✓ ${payload.test.name}`);
                return;
            case StatusEnum.fail:
                console.log(`${this.indent()}  ⨯ ${payload.test.name}`);
        }
    }

    private indent(): string {
        return Array.from(new Array(this.indentation)).map(() => '  ').join('')
    }
}
