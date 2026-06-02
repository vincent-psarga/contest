import {describe} from "./describe";
import {it} from "./it";
import {jestExpect as expect} from "@jest/expect";
import {ContextNotSetError} from "../../domain/errors/ContextNotSetError";

describe<{name: string}>('context', (context) => {
    describe('when context key has not been set', () => {
        it('throws an exception', () => {
            expect(() => context.get('name')).toThrow(new ContextNotSetError('name'));
        })
    });

    describe('when context is set', () => {
        context.set('name', 'test');

        it('uses the value set', () => {
            expect(context.get('name')).toEqual('test');
        });
    })
})
