import type {ITestSuite} from "../../domain/models/ITestSuite";
import type {ITestLoader} from "../../domain/services/ITestLoader";
import {readdirSync, statSync} from "fs";
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

    async load(workingDirectory: string): Promise<ITestSuite[]> {
        const specFiles = this.findSpecFiles(workingDirectory);
        const fileSuites: ITestSuite[] = [];

        for (const file of specFiles) {
            const fileSuite = new TestSuite(file);
            this.testRegistry.beginSuite(fileSuite);
            try {
                await import(file);
            } finally {
                this.testRegistry.endSuite();
            }
            this.eventBus.emit(ContestEvents.TestFileLoaded, { testFile: { path: file } });
            fileSuites.push(fileSuite);
        }

        return fileSuites;
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
