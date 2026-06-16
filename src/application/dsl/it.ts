import type {TestBody} from "../../domain/models/TestBody";
import {Contest} from "../../Contest";
import {Test} from "../models/Test";

class It {
    private readonly description: string
    private readonly test: TestBody
    private readonly contest: Contest
    private readonly skip: boolean
    private readonly only: boolean

    constructor(
        options: {
            description: string,
            test: TestBody,
            skip?: boolean,
            only?: boolean,
            contest?: Contest,
        }
    ) {
        this.description = options.description;
        this.test = options.test;
        this.contest = options.contest ?? Contest.instance;
        this.skip = options.skip ?? false;
        this.only = options.only ?? false;
    }

    register() {
        this.contest.registerTest(new Test(this.description, this.test, this.skip, this.only));
    }
}

export const it = Object.assign(
    (description: string, test: TestBody) => {
        new It({description, test}).register();
    },
    {
        only: (description: string, test: TestBody) => {
            new It({description, test, only: true}).register();
        },
        skip: (description: string, test: TestBody) => {
            new It({description, test, skip: true}).register();
        },
    }
)
