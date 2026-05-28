import { readdirSync } from "fs";
import { join } from "path";

export function findSpecFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSpecFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".spec.ts")) {
      results.push(fullPath);
    }
  }

  return results;
}
