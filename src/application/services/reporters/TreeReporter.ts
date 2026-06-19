import {
  ContestEvents,
  type PayloadByEvent,
} from "../../../domain/services/events/ContestEvents";
import { StatusEnum, type TestStatus } from "../../../domain/models/TestStatus";
import { AbstractReporter } from "./AbstractReporter";
import type { ILogger } from "../../../domain/services/ILogger";
import type { ITest } from "../../../domain/models/ITest";
import type { ITestContainer } from "../../../domain/models/ITestContainer";
import { isITestFile } from "../../../domain/models/ITestFile";
import { isITestSuite } from "../../../domain/models/ITestSuite";
import { Tree, type TreeNode } from "./Tree";

type TestWithStatus = {
  test: ITest;
  status: TestStatus;
};

export class TreeReporter extends AbstractReporter {
  private readonly tree;

  constructor(logger: ILogger) {
    super(logger);

    this.tree = new Tree<ITestContainer, TestWithStatus>(
      (container) => this.displayContainerName(container),
      (testWithStatus) => this.displayTestWithStatus(testWithStatus),
    );
  }

  onTestEnded(payload: PayloadByEvent[ContestEvents.TestEnded]) {
    super.onTestEnded(payload);
    this.tree.addLeaf(payload.ancestors, payload);
  }

  onTestRunEnded(payload: PayloadByEvent[ContestEvents.TestRunEnded]) {
    this.displayTree();
    super.onTestRunEnded(payload);
  }

  private displayTree(): void {
    this.tree.display().map((line) => this.logger.log(line));
  }

  private displayContainerName(testContainer: ITestContainer): string | null {
    if (isITestFile(testContainer)) {
      return this.logger.typo.important(testContainer.path);
    }

    if (isITestSuite(testContainer)) {
      return testContainer.name;
    }

    return null;
  }

  private displayTestWithStatus({ status, test }: TestWithStatus) {
    switch (status.status) {
      case StatusEnum.ok:
        return `${this.logger.typo.success("✓")} ${test.name}`;
      case StatusEnum.fail:
        return `${this.logger.typo.error("⨯")} ${test.name}`;
      case StatusEnum.notRun:
        return `${this.logger.typo.faded("-")} ${test.name}`;
    }
  }
}
