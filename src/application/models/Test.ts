import type {ITest} from "../../domain/models/ITest";
import type {TestBody} from "../../domain/models/TestBody";
import { v4 as uuidv4 } from "uuid";

export class Test implements ITest {
    public readonly id = uuidv4();

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
