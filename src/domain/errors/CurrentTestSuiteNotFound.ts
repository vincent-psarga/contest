export class CurrentTestSuiteNotFound extends Error {
    constructor() {
        super(`No current test suite`);
    }
}
