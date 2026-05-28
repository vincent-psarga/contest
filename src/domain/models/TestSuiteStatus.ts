import {StatusEnum} from "./TestStatus";

export type TestSuiteStatus = |
    {
        status: StatusEnum.notRun
    } |
    {
        status: StatusEnum.ok;
    } |
    {
        status: StatusEnum.fail;
        errors: Error[];
    }
