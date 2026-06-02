import type {ITestContextRegistry} from "../../domain/services/ITestContextRegistry";
import {Context} from "../dsl/Context";
import type {ITestSuite} from "../../domain/models/ITestSuite";
import type {Callbackable} from "../../domain/models/IContext";
import {CurrentTestSuiteNotFound} from "../../domain/errors/CurrentTestSuiteNotFound";
import {ContextStorage} from "./ContextStorage";
import {ExecutionContext} from "./ExecutionContext";

export class TestContextRegistry implements ITestContextRegistry {
    private readonly contextByTestSuiteId = new Map<string, Context<unknown>>();
    private readonly contextStorageByTestSuite = new Map<string, ContextStorage<unknown>>();

    private currentExecutionContext: ExecutionContext<unknown> | null = null;

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
        try {
            this.currentExecutionContext = new ExecutionContext(
                ancestors.reduce((acc, testSuite) => {
                    const storage = this.contextStorageByTestSuite.get(testSuite.id);
                    if (storage) {
                        acc.push(storage);
                    }
                    return acc;
                }, [] as ContextStorage<unknown>[]));

            await callback();
        } finally {
            this.currentExecutionContext = null;
        }
    }

    get<T, K extends keyof T>(key: K): T[K] {
        if (this.currentExecutionContext === null) {
            throw new Error('Get called outside of test loop')
        }

        return (this.currentExecutionContext as ExecutionContext<T>).get(key);
    }

    set<T, K extends keyof T>(key: K, value: T[K]): void {
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
