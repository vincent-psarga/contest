import type {IContext} from "../../domain/models/IContext";
import {Contest} from "../../Contest";
import {TestSuite} from "../models/TestSuite";
import type {ISharedContext} from "../../domain/models/ISharedContext";

class Describe<T> {
    private readonly description: string
    private readonly content: (context: IContext<T>) => void
    private readonly only: boolean
    private readonly skip: boolean
    private readonly contest: Contest

    constructor(
        options: {
            description: string,
            content: (context: IContext<T>) => void,
            only?: boolean,
            skip?: boolean,
        }
    ) {
        this.description = options.description;
        this.content = options.content;
        this.only = options.only ?? false
        this.skip = options.skip ?? false
        this.contest = Contest.instance
    }

    register() {
        const testSuite = new TestSuite(this.description, this.skip, this.only);
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
        new Describe<T>({description, content}).register();
    },
    {
        with: <T>(description: string, sharedContext: ISharedContext<T>, tests: (context: IContext<T>) => void) => {
            new Describe<T>({
                description,
                content: (context)=> {
                    sharedContext.setup(context);
                    tests(context);
                }
            }).register();
        },
        withExamples: <E, C>(description: string, examples: E[], tests: (example: E, context: IContext<C>) => void) => {
            new Describe<C>({
                description,
                content: (context) => {
                    for (const example of examples) {
                        tests(example, context);
                    }
                }
            }).register();
        },
        only: <T>(description: string, content: (context: IContext<T>) => void) => {
            new Describe<T>({description, content, only: true}).register();
        },
        skip: <T>(description: string, content: (context: IContext<T>) => void) => {
            new Describe<T>({description, content, skip: true}).register();
        }
    }
);
