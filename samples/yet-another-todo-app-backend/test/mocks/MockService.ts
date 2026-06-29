import type { Mocked } from "jest-mock";

export function makeMock<T>(baseMock: Mocked<T>) {
  return (mocks?: Partial<Mocked<T>>) => {
    return {
      ...baseMock,
      ...mocks,
    };
  };
}
