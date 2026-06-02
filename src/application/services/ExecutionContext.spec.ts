import {ContextStorage} from "./ContextStorage";
import {describe} from "../dsl/describe";
import {it} from "../dsl/it";
import {jestExpect as expect} from "@jest/expect";
import {ContextSetInTestLoop} from "../../domain/errors/ContextSetInTestLoop";
import {beforeEach} from "../dsl/beforeEach";
import {ContextNotSetError} from "../../domain/errors/ContextNotSetError";
import {fn} from "jest-mock";
import {ExecutionContext} from "./ExecutionContext";

type SampleContext = { name: string }

describe<{
    contextStorages: ContextStorage<SampleContext>[]
}>('ExecutionContext', (context) => {
    let executionContext: ExecutionContext<SampleContext>;
    context.set('contextStorages', []);

    beforeEach(() => {
        executionContext = new ExecutionContext<SampleContext>(context.get('contextStorages'))
    })

    describe('set', () => {
        it('throws a ContextSetInTestLoop error', () => {
            expect(() => executionContext.set('name', 'whatever')).toThrow(new ContextSetInTestLoop);
        })
    });

    describe('get', () => {
        describe('when the key is not set in the provided ContextStorage', () => {
            context.set('contextStorages', [
                new ContextStorage()
            ]);

            it('throws a ContextNotSetError', () => {
                expect(() => executionContext.get('name')).toThrow(new ContextNotSetError('name'));
            })
        });


        describe('when the key is not set in the provided ContextStorage', () => {
            context.set('contextStorages', () => {
                const storage = new ContextStorage<SampleContext>();
                storage.set('name', 'some value');
                return [storage]
            });

            it('returns the value from the context storage', () => {
                expect(executionContext.get('name')).toEqual('some value');
            });

            describe('when the key is set by multiple contexts', () => {
                const firstMock = fn<() => string>().mockReturnValue('first-mock');
                const secondMock = fn<() => string>().mockReturnValue('second-mock');

                context.set('contextStorages', () => {
                    const firstStorage = new ContextStorage<SampleContext>();
                    const secondStorage = new ContextStorage<SampleContext>();

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
