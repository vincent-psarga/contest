import type { TestBody } from "./TestBody";

export interface ITest {
  id: string;
  name: string;
  body: TestBody;
  only: boolean;
  skip: boolean;
  timeout: number | null;
}
