import type {IContext} from "../../domain/models/IContext";
import {Contest} from "../../Contest";
import {TestSuite} from "../models/TestSuite";
import type {ISharedContext} from "../../domain/models/ISharedContext";

class Describe<T> {
    constructor(
        private readonly name: string,
        private readonly content: (context: IContext<T>) => void,
        private readonly contest = Contest.instance
    ) {}

    register() {
        const testSuite = new TestSuite(this.name);
        this.contest.registerTestSuite(
            testSuite,
            () => {
                this.content(this.contest.getContext<T>(testSuite));
            }
        );
    }
}

export const describe = Object.assign(
    <T>(description: string, content: (context: IContext<T>) => void) => {
        new Describe<T>(description, content).register();
    },
    {
        with: <T>(description: string, sharedContext: ISharedContext<T>, tests: (context: IContext<T>) => void) => {
            new Describe<T>(
                description,
                (context) => {
                    sharedContext.setup(context);
                    tests(context);
                }
            ).register();
        }
    }
);
