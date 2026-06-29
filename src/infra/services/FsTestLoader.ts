import type {
  ITestLoader,
  TestLoadOptions,
} from "../../domain/services/ITestLoader";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import type { IEventBus } from "../../domain/services/events/IEventBus";
import { ContestEvents } from "../../domain/services/events/ContestEvents";
import type { ITestRegistry } from "../../domain/services/ITestRegistry";
import type { ITestFile } from "../../domain/models/ITestFile";
import { TestFile } from "../../application/models/TestFile";
import { globMatch } from "../utils/globMatch";

export type ReadDir = (
  path: string,
) => { name: string; isDirectory: () => boolean; isFile: () => boolean }[];

export type FsTestLoaderConstructorOptions = {
  eventBus: IEventBus;
  testRegistry: ITestRegistry;
  isFile?: (path: string) => boolean;
  readDir?: ReadDir;
};

export class FsTestLoader implements ITestLoader {
  private readonly eventBus: IEventBus;
  private readonly testRegistry: ITestRegistry;
  private readonly isFile: (path: string) => boolean;
  private readonly readDir: (
    path: string,
  ) => { name: string; isDirectory: () => boolean; isFile: () => boolean }[];

  constructor(opts: FsTestLoaderConstructorOptions) {
    this.eventBus = opts.eventBus;
    this.testRegistry = opts.testRegistry;
    this.isFile = opts.isFile ?? ((path: string) => statSync(path).isFile());
    this.readDir =
      opts.readDir ?? ((path) => readdirSync(path, { withFileTypes: true }));
  }

  async load(workingDirectory: string, opts: TestLoadOptions) {
    const specFiles = this.findSpecFiles(workingDirectory, opts);
    const testFileSuites: ITestFile[] = [];

    for (const file of specFiles) {
      const testFile = new TestFile(file);
      await this.testRegistry.registerTestFile(testFile, () => import(file));
      this.eventBus.emit(ContestEvents.TestFileLoaded, { testFile });
      testFileSuites.push(testFile);
    }

    return testFileSuites;
  }

  private findSpecFiles(dir: string, opts: TestLoadOptions): string[] {
    if (this.isFile(dir)) {
      return [dir];
    }

    const results: string[] = [];
    const entries = this.readDir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (!globMatch(fullPath, opts.excludes)) {
        if (entry.isDirectory()) {
          results.push(...this.findSpecFiles(fullPath, opts));
        } else if (entry.isFile() && globMatch(entry.name, opts.includes)) {
          results.push(fullPath);
        }
      }
    }

    return results;
  }
}
