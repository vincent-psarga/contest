import type {ITestSuite} from "../../domain/models/ITestSuite";
import type {ITestLoader} from "../../domain/services/ITestLoader";
import {readdirSync, statSync} from "fs";
import {join} from "path";
import {TestSuite} from "../../application/models/TestSuite";
import type {IEventBus} from "../../domain/services/events/IEventBus";
import {ContestEvents} from "../../domain/services/events/ContestEvents";
import type {ITestRegistry} from "../../domain/services/ITestRegistry";
import type {ITestFile} from "../../domain/models/ITestFile";
import {TestFile} from "../../application/models/TestFile";

export class FsTestLoader implements ITestLoader {
    constructor(
        private readonly eventBus: IEventBus,
        private readonly testRegistry: ITestRegistry,
        private readonly extMatcher = ".spec.ts"
    ) {}

    async load(workingDirectory: string) {
        const specFiles = this.findSpecFiles(workingDirectory);
        const testFileSuites: ITestFile[] = [];

        for (const file of specFiles) {
            const testFile = new TestFile(file);
            await this.testRegistry.registerTestFile(testFile, () => import(file));
            this.eventBus.emit(ContestEvents.TestFileLoaded, { testFile });
            testFileSuites.push(testFile);
        }

        return testFileSuites;
    }

    private findSpecFiles(dir: string): string[] {
        if (statSync(dir).isFile()) {
            return [dir];
        }

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
