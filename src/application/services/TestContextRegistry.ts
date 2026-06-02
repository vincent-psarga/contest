import type {ITestContextRegistry} from "../../domain/services/ITestContextRegistry";
import {Context} from "../dsl/Context";
import type {ITestSuite} from "../../domain/models/ITestSuite";
import type {Callbackable, IContext} from "../../domain/models/IContext";
import {CurrentTestSuiteNotFound} from "../../domain/errors/CurrentTestSuiteNotFound";
import {ContextStorage} from "./ContextStorage";
import {ContextNotSetError} from "../../domain/errors/ContextNotSetError";

export class TestContextRegistry implements ITestContextRegistry {
    private readonly contextByTestSuiteId = new Map<string, Context<unknown>>();
    private readonly contextStorageByTestSuite = new Map<string, ContextStorage<unknown>>();

    private currentContextStorage: ContextStorage<unknown>[] | null = null;

    constructor(
        private readonly getCurrentTestSuite: () => ITestSuite | null
    ) {}

    getContext<T>(testSuiteId: ITestSuite['id']): Context<T> {
        let cachedContext = this.contextByTestSuiteId.get(testSuiteId);
        if (cachedContext) {
            return cachedContext as Context<T>;
        }

        const context = new Context<T>(this);
        this.contextByTestSuiteId.set(testSuiteId, context);
        return context;
    }

    async withAncestors(ancestors: ITestSuite[], callback: () => Promise<void>) {
        this.currentContextStorage = ancestors.reduce((acc, testSuite) => {
            const storage = this.contextStorageByTestSuite.get(testSuite.id);
            if (storage) {
                acc.push(storage as ContextStorage<unknown>);
            }
            return acc;
        }, [] as ContextStorage<unknown>[]);

        await callback();
        this.currentContextStorage = null;
    }

    get<T, K extends keyof T>(key: K, context: IContext<T>): T[K] {
        if (this.currentContextStorage === null) {
            throw new Error('Get called outside of test loop')
        }

        const value: null | T[K] = this.currentContextStorage.reduce((acc, context) => {
            try {
                return (context as ContextStorage<T>).get(key as keyof T) as T[K];
            } catch {
                return acc;
            }
        }, null as null | T[K]);

        if (value === null) {
            throw new ContextNotSetError(String(key));
        }
        return value;
    }

    set<T, K extends keyof T>(key: K, value: T[K], context: IContext<T>): void {
        const testSuite = this.getCurrentTestSuite();
        if (!testSuite) {
            throw new CurrentTestSuiteNotFound()
        }

        const storage = (this.contextStorageByTestSuite.get(testSuite.id) ?? new ContextStorage()) as ContextStorage<T>;
        storage.set(key as keyof T, value as Callbackable<T[K]>);
        this.contextStorageByTestSuite.set(
            testSuite.id,
            storage,
        )
    }

}
