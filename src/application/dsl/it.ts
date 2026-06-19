import type { TestBody } from "../../domain/models/TestBody";
import { Contest } from "../../Contest";
import { Test } from "../models/Test";

export type ItOptions = {
  timeout: number;
};

class It {
  private readonly description: string;
  private readonly test: TestBody;
  private readonly contest: Contest;
  private readonly skip: boolean;
  private readonly only: boolean;
  private readonly timeout: number | null;

  constructor(
    options: {
      description: string;
      test: TestBody;
      skip?: boolean;
      only?: boolean;
      contest?: Contest;
    } & Partial<ItOptions>,
  ) {
    this.description = options.description;
    this.test = options.test;
    this.contest = options.contest ?? Contest.instance;
    this.skip = options.skip ?? false;
    this.only = options.only ?? false;
    this.timeout = options.timeout ?? null;
  }

  register() {
    this.contest.registerTest(
      new Test(this.description, this.test, this.skip, this.only, this.timeout),
    );
  }
}

export const it = Object.assign(
  (description: string, test: TestBody, opts?: Partial<ItOptions>) => {
    new It({ description, test, ...opts }).register();
  },
  {
    only: (description: string, test: TestBody, opts?: Partial<ItOptions>) => {
      new It({ description, test, only: true, ...opts }).register();
    },
    skip: (description: string, test: TestBody, opts?: Partial<ItOptions>) => {
      new It({ description, test, skip: true, ...opts }).register();
    },
  },
);
