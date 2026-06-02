import {describe} from "../dsl/describe";
import {it} from "../dsl/it";
import {beforeEach} from "../dsl/beforeEach";
import {jestExpect as expect} from "@jest/expect";
import {ContextNotSetError} from "../../domain/errors/ContextNotSetError";
import {fn, type Mock} from 'jest-mock'
import {ContextStorage} from "./ContextStorage";

type TestContext = {
    name: string
}

describe('ContextStorage', () => {
    let contextStorage: ContextStorage<TestContext>

    beforeEach(() => {
        contextStorage = new ContextStorage<TestContext>();
    });

    describe('get', () => {
        describe('when the key is not set', () => {
            it('throws a ContextNotSetError', () => {
                expect(() => contextStorage.get('name')).toThrow(new ContextNotSetError('name'));
            });
        });

        describe('when the key has been set with a value', () => {
            beforeEach(() => {
                contextStorage.set('name', 'test-value');
            })

            it('returns the value', () => {
                expect(contextStorage.get('name')).toEqual('test-value');
            });
        });

        describe('when the key has been set with a callback', () => {
            let callback: Mock<() => string>;

            beforeEach(() => {
                callback = fn<() => string>().mockReturnValue('test-value-from-callback');

                contextStorage.set('name', callback);
            });


            it('does not call the callback until the key has been queried', () => {
                expect(callback).not.toHaveBeenCalled();
            });

            it('returns the value', () => {
                expect(contextStorage.get('name')).toEqual('test-value-from-callback');
            });

            it('runs the callback only once, no matter how many queries have been done', () => {
                contextStorage.get('name');
                contextStorage.get('name');

                expect(callback).toHaveBeenCalledTimes(1);
            });
        });
    });
})
