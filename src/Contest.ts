import { FsTestLoader } from "./infra/services/FsTestLoader";
import type {IEventBus} from "./domain/services/events/IEventBus";
import {EventBus} from "./application/services/events/EventBus";
import type {ITestLoader} from "./domain/services/ITestLoader";
import {DebugListener} from "./application/services/events/DebugListener";
import type {ITestRegistry} from "./domain/services/ITestRegistry";
import {TestRegistry} from "./application/services/TestRegistry";
import type {ITestSuite} from "./domain/models/ITestSuite";
import type {ITest} from "./domain/models/ITest";
import type {ITestRunner} from "./domain/services/ITestRunner";
import {TestRunner} from "./application/services/TestRunner";

type ContestOptions = {
    testLoader: ITestLoader;
    testRegistry: ITestRegistry;
    testRunner: ITestRunner;
    eventBus: IEventBus;
}

export class Contest {
    static readonly instance: Contest = new Contest();
    private readonly testLoader: ITestLoader;
    private readonly testRegistry: ITestRegistry;
    private readonly testRunner: ITestRunner;
    private readonly eventBus: IEventBus;

    constructor(
        opts?: Partial<ContestOptions>
    ) {
        this.eventBus = opts?.eventBus ?? new EventBus();
        this.testRegistry = opts?.testRegistry ?? new TestRegistry(this.eventBus);
        this.testLoader = opts?.testLoader ?? new FsTestLoader(this.eventBus, this.testRegistry);
        this.testRunner = opts?.testRunner ?? new TestRunner(this.eventBus);

        this.eventBus.addListener(new DebugListener());
    }

    async run() {
      await this.testLoader.load(process.cwd());
      const status = await this.testRunner.runTestSuites(this.testRegistry.testSuites);

      console.log({status})
    }

    async registerTestSuite<T>(testSuite: ITestSuite<T>, callback: () => void | Promise<void>) {
        return this.testRegistry.registerTestSuite(testSuite, callback);
    }

    registerTest(test: ITest) {
        return this.testRegistry.registerTest(test);
    }
}
