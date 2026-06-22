import { SharedExamples } from "../models/SharedExamples";
import { TestSuite } from "../models/TestSuite";
import { Contest } from "../../Contest";

export function itBehavesLike<T extends object>(
  sharedExamples: SharedExamples<T>,
  examplesContext: T,
) {
  const testSuite = new TestSuite(`it behaves like ${sharedExamples.name}`);
  Contest.instance.registerTestSuite(testSuite, () => {
    const context = Contest.instance.getContext<T>(testSuite);

    for (const key of Object.keys(examplesContext)) {
      const value = examplesContext[key as keyof T];
      context.set(key as keyof T, () => value!);
    }

    sharedExamples.examples(context);
  });
}
