import {makeFactory} from "../Factory";
import type {TestPlanEntry} from "../../../src/domain/models/TestPlan";
import {ITestFactory} from "./ITestFactory";

export const TestPlanEntryFactory = makeFactory<TestPlanEntry>(() => {
    return {
        test: ITestFactory(),
        ancestors: [],
        skip: false,
        only: false,
        timeout: 100
    }
})
