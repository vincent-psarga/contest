import type { ITestRegistry } from "../../domain/services/ITestRegistry";
import {
  type Hooks,
  isITestSuite,
  type ITestSuite,
} from "../../domain/models/ITestSuite";
import type { IEventBus } from "../../domain/services/events/IEventBus";
import { ContestEvents } from "../../domain/services/events/ContestEvents";
import type { ITest } from "../../domain/models/ITest";
import type { TestBody } from "../../domain/models/TestBody";
import type { ITestContainer } from "../../domain/models/ITestContainer";
import type { ITestFile } from "../../domain/models/ITestFile";
import type { ISharedContext } from "../../domain/models/ISharedContext";
import type { IContext } from "../../domain/models/IContext";

export class TestRegistry implements ITestRegistry {
  private readonly _testContainers: ITestContainer[] = [];
  private readonly _ancestorStack: (ITestContainer | null)[] = [];
  private _currentTestContainer: ITestContainer | null = null;

  constructor(private readonly eventBus: IEventBus) {}

  get testContainers() {
    return this._testContainers;
  }

  get currentTestContainer(): ITestContainer | null {
    return this._currentTestContainer;
  }

  async registerTestFile(
    testFile: ITestFile,
    callback: () => Promise<void>,
  ): Promise<void> {
    this.beginTestContainer(testFile);
    try {
      await callback();
    } finally {
      this.endTestContainer();
    }
  }

  registerTestSuite(testSuite: ITestSuite, callback: () => void): void {
    this.beginTestContainer(testSuite);
    try {
      callback();
    } finally {
      this.endTestContainer();
    }
  }

  registerHook(hook: Hooks, body: TestBody): void {
    if (
      !this._currentTestContainer ||
      !isITestSuite(this._currentTestContainer)
    ) {
      throw new Error(
        `Unable to register hook ${hook} - no current test suite`,
      );
    }
    this._currentTestContainer.addHook(hook, body);
    this.eventBus.emit(ContestEvents.HookRegistered, {
      hook,
      testSuite: this._currentTestContainer,
    });
  }

  registerSharedContext<S, C>(
    sharedContext: ISharedContext<S>,
    context: IContext<C>,
    tests: (context: IContext<C>) => void,
  ): void {
    this.beginTestContainer(sharedContext);
    sharedContext.setup(context as unknown as IContext<S>);
    tests(context);
    this.endTestContainer();
  }

  registerTest(test: ITest): void {
    if (!this._currentTestContainer) {
      throw new Error(
        `Unable to register test "${test.name} - no current test suite`,
      );
    }
    this._currentTestContainer.addTest(test);
  }

  private beginTestContainer(testContainer: ITestContainer): void {
    const previous = this._currentTestContainer;
    if (previous === null) {
      this._testContainers.push(testContainer);
    } else {
      previous.addTestContainer(testContainer);
    }
    this._ancestorStack.push(previous);
    this._currentTestContainer = testContainer;
  }

  private endTestContainer(): void {
    const ending = this._currentTestContainer;
    const previous = this._ancestorStack.pop() ?? null;
    this._currentTestContainer = previous;
    if (ending && isITestSuite(ending)) {
      this.eventBus.emit(ContestEvents.TestSuiteLoaded, {
        testSuite: ending,
        container: previous,
      });
    }
  }
}
