import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsup";

const BIN_OUTPUT = "dist/bin/contest.js";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "bin/contest": "src/bin/contest.ts",
  },
  format: ["esm"],
  target: "node20",
  dts: {
    compilerOptions: {
      ignoreDeprecations: "6.0",
    },
  },
  sourcemap: true,
  clean: true,
  splitting: true,
  shims: false,
  async onSuccess() {
    const original = readFileSync(BIN_OUTPUT, "utf8");
    const patched = original.replace(/^#!.*\r?\n/, "#!/usr/bin/env node\n");
    writeFileSync(BIN_OUTPUT, patched);
    chmodSync(BIN_OUTPUT, 0o755);
  },
});
