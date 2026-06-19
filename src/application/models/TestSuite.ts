import { Hooks, type ITestSuite } from "../../domain/models/ITestSuite";
import type { TestBody } from "../../domain/models/TestBody";
import { AbstractTestContainer } from "./AbstractTestContainer";

export class TestSuite extends AbstractTestContainer implements ITestSuite {
  private readonly _hooks: Partial<Record<Hooks, TestBody>> = {};

  constructor(
    private readonly _name: string,
    private readonly _skip: boolean = false,
    private readonly _only: boolean = false,
    private readonly _timeout: number | null = null,
  ) {
    super();
  }

  get name() {
    return this._name;
  }

  get hooks() {
    return this._hooks;
  }

  addHook(hook: Hooks, body: TestBody) {
    this._hooks[hook] = body;
  }

  get only() {
    return this._only;
  }

  get skip() {
    return this._skip;
  }

  get timeout() {
    return this._timeout;
  }

  isITestSuite() {
    return true;
  }
}
