import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const runtimeDir = join(root, "packages/pet-runtime/src");
const forbidden = ["electron", "pixi.js", "document", "window."];

function files(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const violations = [];
for (const file of files(runtimeDir)) {
  if (!file.endsWith(".ts")) continue;
  const source = readFileSync(file, "utf8");
  for (const token of forbidden) {
    if (source.includes(token)) {
      violations.push(`${file}: forbidden runtime dependency "${token}"`);
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("Runtime boundaries look clean.");
