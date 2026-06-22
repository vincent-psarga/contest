import { FsTestLoader } from "./infra/services/FsTestLoader";
import type { IEventBus } from "./domain/services/events/IEventBus";
import { EventBus } from "./application/services/events/EventBus";
import type { ITestLoader } from "./domain/services/ITestLoader";
import type { ITestRegistry } from "./domain/services/ITestRegistry";
import { TestRegistry } from "./application/services/TestRegistry";
import { Hooks, type ITestSuite } from "./domain/models/ITestSuite";
import type { ITest } from "./domain/models/ITest";
import type { ITestRunner } from "./domain/services/ITestRunner";
import { TestRunner } from "./application/services/TestRunner";
import type { TestBody } from "./domain/models/TestBody";
import { Context } from "./application/dsl/Context";
import type { ITestContextRegistry } from "./domain/services/ITestContextRegistry";
import { TestContextRegistry } from "./application/services/TestContextRegistry";
import * as path from "node:path";
import { ContestEvents } from "./domain/services/events/ContestEvents";
import type { ISharedContext } from "./domain/models/ISharedContext";
import type { IContext } from "./domain/models/IContext";
import type { ITestContainer } from "./domain/models/ITestContainer";
import type { IEventListener } from "./domain/services/events/IEventListener";
import type { ITestPlanBuilder } from "./domain/services/ITestPlanBuilder";
import { TestPlanBuilder } from "./application/services/TestPlanBuilder";

type ContestOptions = {
  testLoader: ITestLoader;
  testRegistry: ITestRegistry;
  testContextRegistry: ITestContextRegistry;
  testPlanBuilder: ITestPlanBuilder;
  testRunner: ITestRunner;
  eventBus: IEventBus;
  timeout: number;
};

const DEFAULT_TIMEOUT = 1000;

export class Contest {
  private static _instance: Contest;
  static initInstance(opts: Partial<ContestOptions>) {
    this._instance = new Contest(opts);
  }

  static get instance(): Contest {
    if (!this._instance) {
      this._instance = new Contest();
    }
    return this._instance;
  }

  private readonly testLoader: ITestLoader;
  private readonly testRegistry: ITestRegistry;
  private readonly testRunner: ITestRunner;
  private readonly testPlanBuilder: ITestPlanBuilder;
  private readonly testContextRegistry: ITestContextRegistry;
  private readonly eventBus: IEventBus;

  constructor(opts?: Partial<ContestOptions>) {
    this.eventBus = opts?.eventBus ?? new EventBus();
    this.testRegistry = opts?.testRegistry ?? new TestRegistry(this.eventBus);
    this.testContextRegistry =
      opts?.testContextRegistry ??
      new TestContextRegistry(() => this.testRegistry.currentTestContainer);
    this.testLoader =
      opts?.testLoader ?? new FsTestLoader(this.eventBus, this.testRegistry);
    this.testPlanBuilder =
      opts?.testPlanBuilder ??
      new TestPlanBuilder(opts?.timeout ?? DEFAULT_TIMEOUT);
    this.testRunner =
      opts?.testRunner ??
      new TestRunner(
        this.eventBus,
        this.testContextRegistry,
        opts?.timeout ?? DEFAULT_TIMEOUT,
      );
  }

  addTestReporter(reporter: IEventListener) {
    this.eventBus.addListener(reporter);
  }

  async run(p?: string) {
    const cwd = process.cwd();
    const testPath = p ? path.join(cwd, p) : cwd;

    this.eventBus.emit(ContestEvents.TestRunStarted, {});
    await this.testLoader.load(testPath);

    const testPlan = this.testPlanBuilder.buildTestPlan(
      this.testRegistry.testContainers,
    );
    const status = await this.testRunner.runTestPlan(testPlan);
    this.eventBus.emit(ContestEvents.TestRunEnded, { status: status });
    return status;
  }

  getContext<T>(testContainer: ITestContainer): IContext<T> {
    return this.testContextRegistry.getContext(testContainer.id);
  }

  registerTestSuite(testSuite: ITestSuite, callback: () => void): void {
    this.testRegistry.registerTestSuite(testSuite, callback);
  }

  registerTest(test: ITest): void {
    this.testRegistry.registerTest(test);
  }

  registerHook(hook: Hooks, body: TestBody): void {
    this.testRegistry.registerHook(hook, body);
  }

  registerSharedContext<T, U>(
    sharedContext: ISharedContext<T>,
    tests: (context: IContext<T & U>) => void,
  ): void {
    this.testRegistry.registerSharedContext(
      sharedContext,
      this.getContext<T & U>(sharedContext),
      tests,
    );
  }
}
