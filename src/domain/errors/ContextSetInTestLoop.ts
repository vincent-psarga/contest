export class ContextSetInTestLoop extends Error {
  constructor() {
    super(`Context can not be set inside the test loop`);
  }
}
