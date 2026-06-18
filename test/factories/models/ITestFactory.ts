import {makeFactory} from "../Factory";
import type {ITest} from "../../../src/domain/models/ITest";
import {v4 as uuidv4} from "uuid";
import {fn} from "jest-mock";

export const ITestFactory = makeFactory<ITest>({
    id: uuidv4(),
    name: `My test #${uuidv4}`,
    body: fn<() => void>(),
    only: false,
    skip: false,
    timeout: null
})
