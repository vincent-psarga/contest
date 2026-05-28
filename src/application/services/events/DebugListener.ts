import type {IEventListener} from "../../../domain/services/events/IEventListener";
import {ContestEvents, type PayloadByEvent} from "../../../domain/services/events/ContestEvents";

export class DebugListener implements IEventListener {
    async onTestFileLoaded(payload: PayloadByEvent[ContestEvents.TestFileLoaded]) {
        console.log(`Loaded test file: ${payload.testFile.path}`)
    }

    async onTestSuiteLoaded(payload: PayloadByEvent[ContestEvents.TestSuiteLoaded]) {
        console.log(`Loaded test suite: ${payload.testSuite.name} (in ${payload.container?.name ?? 'registry root'}`)
    }

    async onTestLoaded(payload: PayloadByEvent[ContestEvents.TestLoaded]) {
        console.log(`Loaded test: ${payload.test.name} (in ${payload.testSuite.name }`)
    }

    async onTestStarted(payload: PayloadByEvent[ContestEvents.TestStarted]) {
        console.log(`Started test: ${payload.test.name}`)
    }

    async onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
        console.log(`Ended test: ${payload.test.name} with status ${JSON.stringify(payload.status)}`)
    }

    async onTestSuiteStarted(payload: PayloadByEvent[ContestEvents.TestSuiteStarted]) {
        console.log(`Started test suite: ${payload.testSuite.name}`)
    }

    async onTestSuiteEnded(payload: PayloadByEvent[ContestEvents.TestSuiteEnded]) {
        console.log(`Ended test suite: ${payload.testSuite.name} with status ${JSON.stringify(payload.status)}`)
    }
}
