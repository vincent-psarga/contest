import * as contest from "contest";
import { jestExpect } from "@jest/expect";
import { fn } from "jest-mock";

Object.assign(globalThis, contest, { expect: jestExpect, fn });

await import("./node_modules/contest/dist/bin/contest.js");
