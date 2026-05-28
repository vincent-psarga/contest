import type {ITest} from "../../domain/models/ITest";
import type {TestBody} from "../../domain/models/TestBody";

export class Test implements ITest {
    constructor(
        private readonly _name: string,
        private readonly _body: TestBody,
    ) {}

    get name() {
        return this._name;
    }

    get body() {
        return this._body;
    }
}
