import type {IEventListener} from "../../../domain/services/events/IEventListener";
import {ContestEvents, type PayloadByEvent} from "../../../domain/services/events/ContestEvents";
import type {ILogger} from "../../../domain/services/ILogger";

export class DebugListener implements IEventListener {
    constructor(
        private readonly logger: ILogger,
    ) {}

    onTestFileLoaded(payload: PayloadByEvent[ContestEvents.TestFileLoaded]) {
        this.logger.debug(`Loaded test file: ${payload.testFile.path}`)
    }

    onTestSuiteLoaded(payload: PayloadByEvent[ContestEvents.TestSuiteLoaded]) {
        this.logger.debug(`Loaded test suite: ${payload.testSuite.name} (in ${JSON.stringify(payload.container)})`)
    }

    onHookRegistered(payload: PayloadByEvent[ContestEvents.HookRegistered]) {
        this.logger.debug(`Registered hook: ${payload.hook} in ${payload.testSuite.name }`)
    }

    onTestLoaded(payload: PayloadByEvent[ContestEvents.TestLoaded]) {
        this.logger.debug(`Loaded test: ${payload.test.name} (in ${payload.testSuite.name }`)
    }

    onTestStarted(payload: PayloadByEvent[ContestEvents.TestStarted]) {
        this.logger.debug(`Started test: ${payload.test.name}`)
    }

    onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
        this.logger.debug(`Ended test: ${payload.test.name} with status ${JSON.stringify(payload.status)}`)
    }

    onTestSuiteStarted(payload: PayloadByEvent[ContestEvents.TestSuiteStarted]) {
        this.logger.debug(`Started test suite: ${payload.testSuite.name}`)
    }

    onTestSuiteEnded(payload: PayloadByEvent[ContestEvents.TestSuiteEnded]) {
        this.logger.debug(`Ended test suite: ${payload.testSuite.name} with status ${JSON.stringify(payload.status)}`)
    }

    onTestRunStarted(payload: PayloadByEvent[ContestEvents.TestRunStarted]) {
        this.logger.debug(`Started test run`)
    }

    onTestRunEnded(payload: PayloadByEvent[ContestEvents.TestRunEnded]) {
        this.logger.debug(`Ended test run with status ${JSON.stringify(payload.status)}`)
    }

    onTestFileStarted(payload: PayloadByEvent[ContestEvents.TestFileStarted]): void {
        this.logger.debug(`Started test file: ${ payload.testFile.path }`)
    }

    onTestFileEnded(payload: PayloadByEvent[ContestEvents.TestFileEnded]): void {
        this.logger.debug(`Ended test file: ${ payload.testFile.path } with status ${JSON.stringify(payload.status)}`)
    }
}
