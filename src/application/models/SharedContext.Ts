import type {ISharedContext} from "../../domain/models/ISharedContext";
import {AbstractTestContainer} from "./AbstractTestContainer";
import type {IContext} from "../../domain/models/IContext";
import {Contest} from "../../Contest";

export class SharedContext<T> extends AbstractTestContainer implements ISharedContext<T> {
    constructor(
        private readonly _name: string,
        private readonly _setup: (context: IContext<T>) => void,
        private readonly contest = Contest.instance
    ) {
        super();
    }

    get name() {
        return this._name;
    }

    get setup() {
        return this._setup;
    }

    register<U>(tests: (context: IContext<T & U>) => void): void {
        this.contest.registerSharedContext<T, U>(this, tests);
    }
}
