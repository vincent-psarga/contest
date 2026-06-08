import {describe} from "../dsl/describe";
import {beforeEach} from "../dsl/beforeEach";
import {it} from "../dsl/it";
import {jestExpect as expect} from "@jest/expect";
import {ContextNotSetError} from "../../domain/errors/ContextNotSetError";
import {fn, type Mock} from "jest-mock";
import {Storage} from "./Storage";

type TestContext = {
    name: string,
    falsy: null | undefined | false | {} | []
}

describe('Storage', (context) => {
    let storage: Storage<TestContext>

    beforeEach(() => {
        storage = new Storage<TestContext>();
    });

    describe('get', () => {
        describe('when the key is not set', () => {
            it('throws a ContextNotSetError', () => {
                expect(() => storage.get('name')).toThrow(new ContextNotSetError('name'));
            });
        });

        describe('when the key has been set with a value', () => {
            beforeEach(() => {
                storage.set('name', 'test-value');
            })

            it('returns the value', () => {
                expect(storage.get('name')).toEqual('test-value');
            });
        });

        describe.withExamples(
            'when the key has been set with a falsy value',
            [null, undefined, false, [], {}],
            (value) => {
                context.when({'value': value}, () => {
                    it(`returns ${JSON.stringify(value)}`, () => {
                        storage.set('falsy', value);
                        expect(storage.get('falsy')).toEqual(value);
                    });
                })
            }
        )

        describe('when the key has been set with a callback', () => {
            let callback: Mock<() => string>;

            beforeEach(() => {
                callback = fn<() => string>().mockReturnValue('test-value-from-callback');

                storage.set('name', callback);
            });


            it('does not call the callback until the key has been queried', () => {
                expect(callback).not.toHaveBeenCalled();
            });

            it('returns the value', () => {
                expect(storage.get('name')).toEqual('test-value-from-callback');
            });

            it('runs the callback only once, no matter how many queries have been done', () => {
                storage.get('name');
                storage.get('name');

                expect(callback).toHaveBeenCalledTimes(1);
            });
        });
    });
})
