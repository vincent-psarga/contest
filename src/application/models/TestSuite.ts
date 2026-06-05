import {Hooks, type ITestSuite} from "../../domain/models/ITestSuite";
import type {TestBody} from "../../domain/models/TestBody";
import {AbstractTestContainer} from "./AbstractTestContainer";
import {TestContainerType} from "../../domain/models/ITestContainer";

export class TestSuite extends AbstractTestContainer implements ITestSuite {
    private readonly _hooks: Partial<Record<Hooks, TestBody>> = {}

    constructor(
        private readonly _name: string
    ) {
        super();
    }

    get type(): TestContainerType.TestSuite {
        return TestContainerType.TestSuite;
    }

    get name() {
        return this._name;
    }

    get hooks() {
        return this._hooks;
    }

    addHook(hook: Hooks, body: TestBody) {
        this._hooks[hook] = body;
    }
}
