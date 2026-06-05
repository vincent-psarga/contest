import {describe} from "../../application/dsl/describe";
import {it} from "../../application/dsl/it";
import {jestExpect as expect} from "@jest/expect";
import {respondsWith} from "./respondsWith";

type WithWhatever = {
    whatever: () => number;
}

describe<{tbd: WithWhatever}>('respondsWith', (context) => {
    context.when('tbd does not respond to the key', {tbd: {} as WithWhatever}, () => {
        it('returns false', () => {
            expect(respondsWith(context.get('tbd'), 'whatever', 'zob')).toBe(false);
        })
    });

    context.when('tbd responds with another value', {tbd: {whatever: () => 123}}, () => {
        it('returns false', () => {
            expect(respondsWith(context.get('tbd'), 'whatever', 0)).toBe(false);
        })
    });

    context.when('tbd.key() throws an error', {tbd: {
        whatever: () => {
            throw new Error('Oups...')
        }}}, () => {

        it('returns false', () => {
            expect(respondsWith(context.get('tbd'), 'whatever', 0)).toBe(false);
        })
    });

    context.when('tbd.key() returns the expected value', {tbd: {whatever: () => 0}}, () => {
        it('returns true', () => {
            expect(respondsWith(context.get('tbd'), 'whatever', 0)).toBe(true);
        })
    })
})
