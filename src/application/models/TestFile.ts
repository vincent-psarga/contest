import {AbstractTestContainer} from "./AbstractTestContainer";
import type {ITestFile} from "../../domain/models/ITestFile";

export class TestFile extends AbstractTestContainer implements ITestFile {
    constructor(
        private readonly _path: string
    ) {
        super();
    }

    get path() {
        return this._path;
    }

    isITestFile() {
        return true;
    }
}
