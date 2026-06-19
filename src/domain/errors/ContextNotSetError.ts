export class ContextNotSetError extends Error {
  constructor(accessor: string) {
    super(`Unable to get "${accessor}" in context: value is not set`);
  }
}
