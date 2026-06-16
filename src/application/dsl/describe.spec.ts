import {describe} from "./describe";
import {it} from "./it";
import * as assert from "node:assert";

class SampleSUT {
    hello(name: string) {
        return `Hello ${name}`;
    }
}

describe('SampleSUT', () => {
    describe('.sayHello', () => {
        it('returns a greeting', () => {
            assert.equal(new SampleSUT().hello('world'), 'Hello world');
        })
    });

    describe.skip('a skipped describe is not executed', () => {
        it('this test will fail', () => {
            throw new Error('This will not run well')
        })
    })
});
