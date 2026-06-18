import {makeFactory} from "../Factory";
import type {ITest} from "../../../src/domain/models/ITest";
import {v4 as uuidv4} from "uuid";
import {fn} from "jest-mock";

export const ITestFactory = makeFactory<ITest>(
    () => {
        const id = uuidv4()

        return {
            id,
            name: `My test #${id}`,
            body: fn<() => void>(),
            only: false,
            skip: false,
            timeout: null
        }
    });
