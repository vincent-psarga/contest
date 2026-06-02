import {describe} from "../dsl/describe";
import {it} from "../dsl/it";
import {TestContextRegistry} from "./TestContextRegistry";
import {beforeEach} from "../dsl/beforeEach";
import {v4 as uuidv4} from "uuid";
import { jestExpect as expect} from "@jest/expect";
import type {ITestSuite} from "../../domain/models/ITestSuite";
import {TestSuite} from "../models/TestSuite";

describe('TestContextRegistry', () => {
    let testContextRegistry: TestContextRegistry;

    beforeEach(() => {
        testContextRegistry = new TestContextRegistry(
            () => new TestSuite('whatever'),
        )
    })

    describe('#getContext', () => {
        describe('when there has been no queries yet', () => {
            it('creates a new instance Context instance when nothing has been queried yet ', async () => {
                const context = testContextRegistry.getContext(uuidv4());

                expect(context.id).toBeDefined();
            });
        });

        describe('when the context has already been queried', () => {
            let testSuiteId: ITestSuite['id'];

            beforeEach(() => {
                testSuiteId = uuidv4();
            });

            it('reuses the same instance on the second query', () => {
                const originalContext = testContextRegistry.getContext(testSuiteId);
                const secondContext = testContextRegistry.getContext(testSuiteId);

                expect(secondContext).toEqual(originalContext);
            })
        })

    });
});
