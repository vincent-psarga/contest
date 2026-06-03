import type {ITestContextRegistry} from "../../domain/services/ITestContextRegistry";
import {Context} from "../dsl/Context";
import {isITestSuite, type ITestSuite} from "../../domain/models/ITestSuite";
import type {Callbackable} from "../../domain/models/IContext";
import {CurrentTestSuiteNotFound} from "../../domain/errors/CurrentTestSuiteNotFound";
import {ContextStorage} from "./ContextStorage";
import {ExecutionContext} from "./ExecutionContext";
import type {ITestContainer} from "../../domain/models/ITestContainer";

export class TestContextRegistry implements ITestContextRegistry {
    private readonly contextByTestContainerId = new Map<string, Context<unknown>>();
    private readonly contextStorageByTestContainerId = new Map<string, ContextStorage<unknown>>();

    private currentExecutionContext: ExecutionContext<unknown> | null = null;

    constructor(
        private readonly getCurrentTestContainer: () => ITestContainer | null
    ) {}

    getContext<T>(testContainerId: ITestContainer['id']): Context<T> {
        let cachedContext = this.contextByTestContainerId.get(testContainerId);
        if (cachedContext) {
            return cachedContext as Context<T>;
        }

        const context = new Context<T>(this);
        this.contextByTestContainerId.set(testContainerId, context);
        return context;
    }

    async withAncestors(ancestors: ITestContainer[], callback: () => Promise<void>) {
        try {
            this.currentExecutionContext = new ExecutionContext(
                ancestors.reduce((acc, testSuite) => {
                    const storage = this.contextStorageByTestContainerId.get(testSuite.id);
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
        const testSuite = this.getCurrentTestContainer();
        if (!testSuite || !isITestSuite(testSuite)) {
            throw new CurrentTestSuiteNotFound()
        }

        const storage = (this.contextStorageByTestContainerId.get(testSuite.id) ?? new ContextStorage()) as ContextStorage<T>;
        storage.set(key as keyof T, value as Callbackable<T[K]>);
        this.contextStorageByTestContainerId.set(
            testSuite.id,
            storage as ContextStorage<unknown>,
        )
    }

}
