import type { IContext } from "../../domain/models/IContext";
import { SharedExamples } from "../models/SharedExamples";

export function sharedExamples<T>(
  name: string,
  tests: (context: IContext<T>) => void,
) {
  return new SharedExamples<T>(name, tests);
}
