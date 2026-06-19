export type Factory<T> = (data?: Partial<T>) => T;

export function makeFactory<T>(defaultData: () => T): Factory<T> {
  return (data?: Partial<T>) => {
    return {
      ...defaultData(),
      ...data,
    };
  };
}
