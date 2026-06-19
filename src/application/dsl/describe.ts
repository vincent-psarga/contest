import type { IContext } from "../../domain/models/IContext";
import { Contest } from "../../Contest";
import { TestSuite } from "../models/TestSuite";
import type { ISharedContext } from "../../domain/models/ISharedContext";

export type DescribeOptions = {
  timeout: number;
};

class Describe<T> {
  private readonly description: string;
  private readonly content: (context: IContext<T>) => void;
  private readonly only: boolean;
  private readonly skip: boolean;
  private readonly contest: Contest;
  private readonly timeout: number | null;

  constructor(
    options: {
      description: string;
      content: (context: IContext<T>) => void;
      only?: boolean;
      skip?: boolean;
    } & Partial<DescribeOptions>,
  ) {
    this.description = options.description;
    this.content = options.content;
    this.only = options.only ?? false;
    this.skip = options.skip ?? false;
    this.timeout = options.timeout ?? null;
    this.contest = Contest.instance;
  }

  register() {
    const testSuite = new TestSuite(
      this.description,
      this.skip,
      this.only,
      this.timeout,
    );
    this.contest.registerTestSuite(testSuite, () => {
      this.content(this.contest.getContext<T>(testSuite));
    });
  }
}

export const describe = Object.assign(
  <T>(
    description: string,
    content: (context: IContext<T>) => void,
    opts?: Partial<DescribeOptions>,
  ) => {
    new Describe<T>({ description, content, ...opts }).register();
  },
  {
    with: <T>(
      description: string,
      sharedContext: ISharedContext<T>,
      tests: (context: IContext<T>) => void,
      opts?: Partial<DescribeOptions>,
    ) => {
      new Describe<T>({
        description,
        content: (context) => {
          sharedContext.setup(context);
          tests(context);
        },
        ...opts,
      }).register();
    },
    withExamples: <E, C>(
      description: string,
      examples: E[],
      tests: (example: E, context: IContext<C>) => void,
      opts?: Partial<DescribeOptions>,
    ) => {
      new Describe<C>({
        description,
        content: (context) => {
          for (const example of examples) {
            tests(example, context);
          }
        },
        ...opts,
      }).register();
    },
    only: <T>(
      description: string,
      content: (context: IContext<T>) => void,
      opts?: Partial<DescribeOptions>,
    ) => {
      new Describe<T>({ description, content, only: true, ...opts }).register();
    },
    skip: <T>(
      description: string,
      content: (context: IContext<T>) => void,
      opts?: Partial<DescribeOptions>,
    ) => {
      new Describe<T>({ description, content, skip: true, ...opts }).register();
    },
  },
);
