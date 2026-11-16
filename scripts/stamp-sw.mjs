// Writes public/sw.js from src/sw.template.js with a per-build id, so every
// deploy ships new worker bytes and installed PWAs pick up the update.
// Runs as part of `build` (see package.json).
import { readFileSync, writeFileSync } from "node:fs";

const sha =
  process.env.RAILWAY_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.SOURCE_COMMIT;
const build = (sha ? sha.slice(0, 12) : Date.now().toString(36)).replace(/[^A-Za-z0-9_-]/g, "");

const template = readFileSync(new URL("../src/sw.template.js", import.meta.url), "utf8");
if (!template.includes('"__BUILD__"')) {
  throw new Error('stamp-sw: "__BUILD__" token not found in src/sw.template.js');
}
writeFileSync(
  new URL("../public/sw.js", import.meta.url),
  template.replaceAll('"__BUILD__"', JSON.stringify(build))
);
console.log(`sw.js stamped with build ${build}`);
