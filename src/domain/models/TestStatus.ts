export enum StatusEnum {
  ok = "OK",
  fail = "FAIL",
  notRun = "NOT_RUN",
}

export type TestStatus =
  | {
      status: StatusEnum.notRun;
    }
  | {
      status: StatusEnum.ok;
    }
  | {
      status: StatusEnum.fail;
      error: Error;
    };
