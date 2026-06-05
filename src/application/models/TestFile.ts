import {AbstractTestContainer} from "./AbstractTestContainer";
import type {ITestFile} from "../../domain/models/ITestFile";
import {TestContainerType} from "../../domain/models/ITestContainer";

export class TestFile extends AbstractTestContainer implements ITestFile {
    constructor(
        private readonly _path: string
    ) {
        super();
    }

    get type(): TestContainerType.TestFile {
        return TestContainerType.TestFile;
    }

    get path() {
        return this._path;
    }
}
