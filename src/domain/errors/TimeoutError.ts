export class TimeoutError extends Error {
    constructor(name: string, timeout: number) {
        super(`Failed to run "${name}" under the ${timeout}ms timeout`);
    }
}
