import {it} from "./it";
import * as assert from "node:assert";

it('can be at the root of the file', () => {
    assert.ok(true);
});

it.skip('a skipped test is not executed', () => {
    throw new Error('This will not run well')
});
