import type {ITestSuite} from "../../domain/models/ITestSuite";
import type {ITestLoader} from "../../domain/services/ITestLoader";
import {readdirSync} from "fs";
import {join} from "path";
import {TestSuite} from "../../application/models/TestSuite";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import {ContestEvents} from "../../domain/services/events/ContestEvents";
import type {ITestRegistry} from "../../domain/services/ITestRegistry";

export class FsTestLoader implements ITestLoader {
    constructor(
        private readonly eventBus: IEventBus,
        private readonly testRegistry: ITestRegistry,
        private readonly extMatcher = ".spec.ts"
    ) {}

    async load(workingDirectory: string): Promise<ITestSuite<unknown>[]> {
        const specFiles = this.findSpecFiles(workingDirectory);
        return Promise.all(
            specFiles.map(file => {
                return new Promise<ITestSuite<unknown>>((resolve, reject) => {
                    const testSuite = new TestSuite(file);
                    this.testRegistry.registerTestSuite(testSuite, async () => {
                        return import(file)
                            .then(() => {
                                this.eventBus.emit(ContestEvents.TestFileLoaded, { testFile: { path: file } });
                                resolve(testSuite);
                            })
                            .catch(reject);
                    });
                });
            })
        );
    }

    private findSpecFiles(dir: string): string[] {
        const results: string[] = [];
        const entries = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                results.push(...this.findSpecFiles(fullPath));
            } else if (entry.isFile() && entry.name.endsWith(this.extMatcher)) {
                results.push(fullPath);
            }
        }

        return results;
    }
}
