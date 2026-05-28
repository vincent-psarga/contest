import type {TestBody} from "../../domain/models/TestBody";
import {Contest} from "../../Contest";
import {Test} from "../models/Test";

class It {
    constructor(
        private readonly name: string,
        private readonly testBody: TestBody,
        private readonly contest = Contest.instance
    ) {}

    register() {
        this.contest.registerTest(new Test(this.name, this.testBody))
    }
}

export function it(description: string, test: TestBody) {
    new It(description, test).register();
}
