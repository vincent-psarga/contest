import { describe } from "../dsl/describe";
import {it} from "../dsl/it";
import { jestExpect as expect} from '@jest/expect'
import {TestRegistry} from "./TestRegistry";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import type {IEventListener} from "../../domain/services/events/IEventListener";
import type {ContestEvents, PayloadByEvent} from "../../domain/services/events/ContestEvents";
import {TestSuite} from "../models/TestSuite";

describe('TestRegistry', () => {
    describe('.register', () => {
        describe('when the is no test suite loaded yet', () => {
            it('adds the testSuite at the root level', () => {
                const eventBus: IEventBus = {
                    addListener(listener: IEventListener): void {
                    },

                    emit<K extends ContestEvents>(event: K, payload: PayloadByEvent[K]): Promise<void> {
                        return Promise.resolve(undefined);
                    }
                };

                const testRegistry = new TestRegistry(eventBus);

                const testSuite = new TestSuite('My test suite');
                testRegistry.registerTestSuite(testSuite, () => {});

                expect(testRegistry.testSuites).toEqual([testSuite]);
            })
        })
    })
})
