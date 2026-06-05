import {describe} from "../dsl/describe";
import {it} from "../dsl/it";
import {jestExpect as expect} from "@jest/expect";
import {ContextSetInTestLoop} from "../../domain/errors/ContextSetInTestLoop";
import {beforeEach} from "../dsl/beforeEach";
import {ContextNotSetError} from "../../domain/errors/ContextNotSetError";
import {fn} from "jest-mock";
import {ExecutionContext} from "./ExecutionContext";
import type {IStorage} from "../../domain/models/IStorage";
import {Storage} from "../utils/Storage";

type SampleContext = { name: string }

describe<{
    storages: Storage<SampleContext>[]
}>('ExecutionContext', (context) => {
    let executionContext: IStorage<SampleContext>;
    context.set('storages', []);

    beforeEach(() => {
        executionContext = new ExecutionContext<SampleContext>(context.get('storages'))
    })

    describe('set', () => {
        it('throws a ContextSetInTestLoop error', () => {
            expect(() => executionContext.set('name', 'whatever')).toThrow(new ContextSetInTestLoop);
        })
    });

    describe('get', () => {
        describe('when the key is not set in the provided ContextStorage', () => {
            context.set('storages', [
                new Storage()
            ]);

            it('throws a ContextNotSetError', () => {
                expect(() => executionContext.get('name')).toThrow(new ContextNotSetError('name'));
            })
        });


        describe('when the key is not set in the provided ContextStorage', () => {
            context.set('storages', () => {
                const storage = new Storage<SampleContext>();
                storage.set('name', 'some value');
                return [storage]
            });

            it('returns the value from the context storage', () => {
                expect(executionContext.get('name')).toEqual('some value');
            });

            describe('when the key is set by multiple contexts', () => {
                const firstMock = fn<() => string>().mockReturnValue('first-mock');
                const secondMock = fn<() => string>().mockReturnValue('second-mock');

                context.set('storages', () => {
                    const firstStorage = new Storage<SampleContext>();
                    const secondStorage = new Storage<SampleContext>();

                    firstStorage.set('name', firstMock);
                    secondStorage.set('name', secondMock);

                    return [firstStorage, secondStorage];
                });

                it('returns the value from the latest context storage that defines the value', () => {
                    expect(executionContext.get('name')).toEqual('second-mock');
                });

                it('does not execute the higher level context getter', () => {
                    expect(firstMock).not.toHaveBeenCalled();
                });
            })
        });
    })
})
