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
import {TimeoutError} from "../../domain/errors/TimeoutError";
import {StatusEnum} from "../../domain/models/TestStatus";
import {ITestFactory} from "../../../test/factories/models/ITestFactory";


class MockTest implements ITest {
    public readonly id = uuidv4()
    public readonly body = fn<() => void>()
    public readonly timeout = 100;

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

type TestRunnerData = {
    eventBus: IEventBus;
    testContextRegistry: ITestContextRegistry,
    testContainers: ITestContainer[],
    tests: ITest[],
    timeout: number
};

describe<TestRunnerData>('TestRunner', (context) => {
    let testRunner: TestRunner;

    context.set('eventBus', new EventBus());
    context.set('testContextRegistry', new TestContextRegistry(() => null));
    context.set('timeout', 100)

    beforeEach(async () => {
        testRunner = new TestRunner(
            context.get('eventBus'),
            context.get('testContextRegistry'),
            context.get('timeout'),
        );
    });

    describe('.runTestContainers', () => {
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
    });

    describe<TestRunnerData>('.runTest', () => {
        context.set('timeout', 10);
        context.set('tests', [
            ITestFactory({
                body: async () => {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
        )]);

        it('fails with a timeout if the test does not end before the default timeout', async () => {
            const test: ITest = context.get('tests')[0]!;

            expect(await testRunner.runTest(test, [])).toEqual({
                status: StatusEnum.fail,
                error: new TimeoutError(test.name, context.get('timeout'))
            });
        });

        describe('when the test has its own timeout', () => {
            context.set('tests', [
                ITestFactory({
                    body: async () => {
                        await new Promise(resolve => setTimeout(resolve, 20));
                    },
                    timeout: 100,
                }
            )]);

            it('overrides the default timeout', async () => {
                const test: ITest = context.get('tests')[0]!;

                expect(await testRunner.runTest(test, [])).toEqual({
                    status: StatusEnum.ok
                });
            })
        })
    })

})
