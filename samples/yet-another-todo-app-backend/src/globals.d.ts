import type {
  describe as _describe,
  it as _it,
  beforeEach as _beforeEach,
  sharedContext as _sharedContext,
  sharedExamples as _sharedExamples,
  itBehavesLike as _itBehavesLike,
} from "contest";
import type { jestExpect as _expect } from "@jest/expect";
import type { fn } from "jest-mock";

declare global {
  const describe: typeof _describe;
  const it: typeof _it;
  const beforeEach: typeof _beforeEach;
  const sharedContext: typeof _sharedContext;
  const sharedExamples: typeof _sharedExamples;
  const itBehavesLike: typeof _itBehavesLike;
  const expect: typeof _expect;
  const fn: typeof fn;
}

export {};
