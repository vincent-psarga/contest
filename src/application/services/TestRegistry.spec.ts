import { describe } from "../dsl/describe";
import {it} from "../dsl/it";
import {TestRegistry} from "./TestRegistry";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import {TestSuite} from "../models/TestSuite";
import type {ITestRegistry} from "../../domain/services/ITestRegistry";
import {beforeEach} from "../dsl/beforeEach";
import * as assert from "node:assert";

describe('TestRegistry', () => {
    let eventBus: IEventBus;
    let testRegistry: ITestRegistry;

    const testSuite = new TestSuite('My test suite');
    const subTestSuite = new TestSuite('My sub suite');


    beforeEach(() => {
        eventBus = {
            addListener() {},
            async emit() {}
        };

        testRegistry = new TestRegistry(eventBus);
    })

    describe('#register', () => {
        describe('when there is no test suite loaded yet', () => {
            beforeEach(() => {
                testRegistry.registerTestSuite(testSuite, () => {});
            })

            it('adds the testSuite at the root level', () => {
                assert.deepEqual(testRegistry.testSuites, [testSuite]);
            })
        });

        describe('when registering sub-test suite in the callback', () => {
            beforeEach(() => {
                testRegistry.registerTestSuite(testSuite, () => {
                    testRegistry.registerTestSuite(subTestSuite, () => {});
                });
            });

            it('stores the subSuite inside the mother one', () => {
                assert.deepEqual(testRegistry.testSuites[0]?.testSuites, [subTestSuite]);
            })
        });
    })
})
