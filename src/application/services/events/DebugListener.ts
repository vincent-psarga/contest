import type {IEventListener} from "../../../domain/services/events/IEventListener";
import {ContestEvents, type PayloadByEvent} from "../../../domain/services/events/ContestEvents";

export class DebugListener implements IEventListener {
    onTestFileLoaded(payload: PayloadByEvent[ContestEvents.TestFileLoaded]) {
        console.log(`Loaded test file: ${payload.testFile.path}`)
    }

    onTestSuiteLoaded(payload: PayloadByEvent[ContestEvents.TestSuiteLoaded]) {
        console.log(`Loaded test suite: ${payload.testSuite.name} (in ${JSON.stringify(payload.container)})`)
    }

    onHookRegistered(payload: PayloadByEvent[ContestEvents.HookRegistered]) {
        console.log(`Registered hook: ${payload.hook} in ${payload.testSuite.name }`)
    }

    onTestLoaded(payload: PayloadByEvent[ContestEvents.TestLoaded]) {
        console.log(`Loaded test: ${payload.test.name} (in ${payload.testSuite.name }`)
    }

    onTestStarted(payload: PayloadByEvent[ContestEvents.TestStarted]) {
        console.log(`Started test: ${payload.test.name}`)
    }

    onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
        console.log(`Ended test: ${payload.test.name} with status ${JSON.stringify(payload.status)}`)
    }

    onTestSuiteStarted(payload: PayloadByEvent[ContestEvents.TestSuiteStarted]) {
        console.log(`Started test suite: ${payload.testSuite.name}`)
    }

    onTestSuiteEnded(payload: PayloadByEvent[ContestEvents.TestSuiteEnded]) {
        console.log(`Ended test suite: ${payload.testSuite.name} with status ${JSON.stringify(payload.status)}`)
    }

    onTestRunStarted(payload: PayloadByEvent[ContestEvents.TestRunStarted]) {
        console.log(`Started test run`)
    }

    onTestRunEnded(payload: PayloadByEvent[ContestEvents.TestRunEnded]) {
        console.log(`Ended test run with status ${JSON.stringify(payload.status)}`)
    }

    onTestFileStarted(payload: PayloadByEvent[ContestEvents.TestFileStarted]): void {
        console.log(`Started test file: ${ payload.testFile.path }`)
    }

    onTestFileEnded(payload: PayloadByEvent[ContestEvents.TestFileEnded]): void {
        console.log(`Ended test file: ${ payload.testFile.path } with status ${JSON.stringify(payload.status)}`)
    }
}
