import type {ITestContextRegistry} from "../../domain/services/ITestContextRegistry";
import {Context} from "../dsl/Context";
import {CurrentTestSuiteNotFound} from "../../domain/errors/CurrentTestSuiteNotFound";
import {ExecutionContext} from "./ExecutionContext";
import type {ITestContainer} from "../../domain/models/ITestContainer";
import type {Callbackable} from "../../domain/models/IStorage";
import {Storage} from "../utils/Storage";

export class TestContextRegistry implements ITestContextRegistry {
    private readonly contextByTestContainerId = new Map<string, Context<unknown>>();
    private readonly storageByTestContainerId = new Map<string, Storage<unknown>>();

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
                    const storage = this.storageByTestContainerId.get(testSuite.id);
                    if (storage) {
                        acc.push(storage);
                    }
                    return acc;
                }, [] as Storage<unknown>[]));

            await callback();
        } finally {
            this.currentExecutionContext = null;
        }
    }

    get<T, K extends keyof T>(key: K): T[K] {
        if (this.currentExecutionContext === null) {
            throw new Error(`get("${String(key)}") called outside of test loop`)
        }

        return (this.currentExecutionContext as ExecutionContext<T>).get(key);
    }

    set<T, K extends keyof T>(key: K, value: T[K]): void {
        const testContainer = this.getCurrentTestContainer();
        if (!testContainer) {
            throw new CurrentTestSuiteNotFound()
        }

        const storage = (this.storageByTestContainerId.get(testContainer.id) ?? new Storage()) as Storage<T>;
        storage.set(key as keyof T, value as Callbackable<T[K]>);
        this.storageByTestContainerId.set(
            testContainer.id,
            storage as Storage<unknown>,
        )
    }

}
