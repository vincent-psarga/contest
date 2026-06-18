import type { ITest } from "../../../src/domain/models/ITest";
import type {ITestContainer} from "../../../src/domain/models/ITestContainer";
import {makeFactory} from "../Factory";
import {v4 as uuidv4} from "uuid";
import {fn} from "jest-mock";

export const ITestContainerFactory = makeFactory<ITestContainer>(() => {
    const id = uuidv4()

    return {
        id,
        only: false,
        skip: false,
        testContainers: [],
        tests: [],
        addTestContainer: fn<(testContainer: ITestContainer) => void>(),
        addTest: fn<(test: ITest) => void>()
    }
})
