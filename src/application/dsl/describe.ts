import type {IContext} from "../../domain/models/IContext";
import {Contest} from "../../Contest";
import {TestSuite} from "../models/TestSuite";
import {Context} from "../models/Context";

class Describe<T> {
    constructor(
        private readonly name: string,
        private readonly content: (context: IContext<T>) => void,
        private readonly contest = Contest.instance
    ) {}

    register() {
        const testSuite = new TestSuite<T>(this.name);
        return this.contest.registerTestSuite(
            testSuite,
            () => {
                this.content(new Context());
            }
        )
    }
}

export function describe<T>(description: string, content: (context: IContext<T>) => void) {
    new Describe<T>(description, content).register();
}
