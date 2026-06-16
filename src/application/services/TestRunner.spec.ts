import {describe} from "../dsl/describe";
import {TestRunner} from "./TestRunner";
import {beforeEach} from "../dsl/beforeEach";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import type {ITestContextRegistry} from "../../domain/services/ITestContextRegistry";
import type {ITestContainer} from "../../domain/models/ITestContainer";
import {EventBus} from "./events/EventBus";
import {TestContextRegistry} from "./TestContextRegistry";
import type {ITest} from "../../domain/models/ITest";
import { v4 as uuidv4 } from "uuid";
import {fn} from "jest-mock";
import {it} from "../dsl/it";
import {jestExpect as expect} from "@jest/expect";


class MockTest implements ITest {
    public readonly id = uuidv4()
    public readonly body = fn<() => void>()

    static only(name: string) {
        return new MockTest(name, false, true);
    }

    static skip(name: string) {
        return new MockTest(name, true, false);
    }

    constructor(
        public readonly name: string,
        public readonly skip: boolean = false,
        public readonly only: boolean = false,
    ) {}
}

class MocktestContainer implements ITestContainer {
    public readonly id = uuidv4();

    constructor(
        public readonly name: string,
        public readonly tests: ITest[],
        public readonly testContainers: ITestContainer[] = [],
        public readonly skip: boolean = false,
        public readonly only: boolean = false
    ) {}

    addTestContainer(testContainer: ITestContainer) {};
    addTest(test: ITest) {};
}

describe<{
    eventBus: IEventBus;
    testContextRegistry: ITestContextRegistry,
    testContainers: ITestContainer[],
    tests: ITest[],
}>('TestRunner', (context) => {
    let testRunner: TestRunner;

    context.set('eventBus', new EventBus());
    context.set('testContextRegistry', new TestContextRegistry(() => null));

    beforeEach(async () => {
        testRunner = new TestRunner(
            context.get('eventBus'),
            context.get('testContextRegistry')
        );
    });

    describe('when a test is marked as .only', () => {
        context.set('tests', [
            new MockTest('My test'),
            MockTest.only('My only test')
        ]);

        context.set('testContainers', () => {
          return [new MocktestContainer('my test suite', context.get('tests'))]
        });

        beforeEach(async () => {
            await testRunner.runTestContainers(context.get('testContainers'));
        });

        it('only executes the test marked with .only', () => {
            const tests = context.get('tests');
            expect(tests[1]?.body).toHaveBeenCalledTimes(1);
        });

        it('does not run the other tests', () => {
            const tests = context.get('tests');
            expect(tests[0]?.body).not.toHaveBeenCalled();
        })
    })
})
