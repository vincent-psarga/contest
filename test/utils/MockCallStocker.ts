import { fn } from "jest-mock";

export class MockCallStocker {
    private static _calls: string[];

    static get calls() {
        return this._calls;
    }

    static resetCalls() {
        this._calls = []
    }

    static fn(name: string) {
        return fn<() => void>().mockImplementation(() => {
            this._calls.push(name);
        })
    }
}
