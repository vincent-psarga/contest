import type { TestBody } from "../../domain/models/TestBody";
import { Contest } from "../../Contest";
import { Hooks } from "../../domain/models/ITestSuite";

class BeforeEach {
  constructor(
    private readonly body: TestBody,
    private readonly contest = Contest.instance,
  ) {}

  register() {
    this.contest.registerHook(Hooks.beforeEach, this.body);
  }
}

export function beforeEach(body: TestBody) {
  new BeforeEach(body).register();
}
