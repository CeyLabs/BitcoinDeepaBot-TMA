#!/usr/bin/env node
// One-off migration: the files in public/emoji/*.svg are not real vectors —
// they're Figma exports that embed a base64 raster image behind a <pattern>
// fill (often cropped from a larger sprite via a transform matrix), so every
// "icon" ships as a multi-megabyte blob. Naively extracting+cropping the
// embedded bitmap ignores that transform and grabs the wrong region for
// anything that isn't a single centered image (see: calendar1/2, graph,
// wallet, gift_standing_order* — all crops from wider sprite sheets).
//
// Sharp (already a project dependency, via libvips/librsvg) renders the SVG
// exactly as a browser would — pattern transform and all — so we rasterize
// through it instead of hand-parsing the SVG.
//
// Usage: node scripts/optimize-emoji-svgs.mjs [--dry-run]

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EMOJI_DIR = path.join(ROOT, "public", "emoji");
const SRC_DIR = path.join(ROOT, "src");
// Original SVGs are archived alongside the optimized assets for reference.
const ORIGINALS_DIR = path.join(EMOJI_DIR, "svg");

const OUTPUT_SIZE = 128; // 2x the largest observed display size (56px) + headroom
const RENDER_DENSITY = 300; // rasterize at high DPI before downscaling, for clean edges
const SIZE_THRESHOLD_BYTES = 100 * 1024; // real vector icons are well under this

const dryRun = process.argv.includes("--dry-run");

function findEmbeddedRasterSvgs() {
    return fs
        .readdirSync(EMOJI_DIR)
        .filter((f) => f.endsWith(".svg"))
        .map((f) => path.join(EMOJI_DIR, f))
        .filter((full) => fs.statSync(full).isFile() && fs.statSync(full).size > SIZE_THRESHOLD_BYTES)
        .filter((full) => {
            const content = fs.readFileSync(full, "utf8");
            return /data:image\/(png|jpe?g);base64,/.test(content);
        });
}

async function convertToWebp(svgPath, webpPath) {
    const resizedPng = path.join(os.tmpdir(), `${path.basename(svgPath, ".svg")}-${Date.now()}.png`);
    await sharp(svgPath, { density: RENDER_DENSITY })
        .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "cover" })
        .png()
        .toFile(resizedPng);
    execFileSync("cwebp", ["-q", "90", resizedPng, "-o", webpPath], { stdio: "inherit" });
    fs.unlinkSync(resizedPng);
}

function updateReferences(oldBasename, newBasename) {
    let output;
    try {
        output = execFileSync("grep", ["-rl", `/emoji/${oldBasename}`, SRC_DIR], {
            encoding: "utf8",
        });
    } catch (err) {
        if (err.status === 1) {
            console.log(`  (no references to ${oldBasename} found in src/)`);
            return;
        }
        throw err;
    }
    const files = output.split("\n").filter(Boolean);

    for (const file of files) {
        const content = fs.readFileSync(file, "utf8");
        const updated = content.split(`/emoji/${oldBasename}`).join(`/emoji/${newBasename}`);
        if (updated !== content) {
            if (!dryRun) fs.writeFileSync(file, updated);
            console.log(`  updated reference in ${path.relative(ROOT, file)}`);
        }
    }
}

async function main() {
    const targets = findEmbeddedRasterSvgs();
    if (targets.length === 0) {
        console.log("No embedded-raster SVGs found.");
        return;
    }

    let totalBefore = 0;
    let totalAfter = 0;

    for (const svgPath of targets) {
        const basename = path.basename(svgPath, ".svg");
        const webpPath = path.join(EMOJI_DIR, `${basename}.webp`);
        const before = fs.statSync(svgPath).size;

        console.log(`${basename}.svg  (${(before / 1024).toFixed(0)}KB) -> ${basename}.webp`);

        if (!dryRun) {
            await convertToWebp(svgPath, webpPath);
        }

        updateReferences(`${basename}.svg`, `${basename}.webp`);

        if (!dryRun) {
            fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
            fs.renameSync(svgPath, path.join(ORIGINALS_DIR, path.basename(svgPath)));
            const after = fs.statSync(webpPath).size;
            totalAfter += after;
            console.log(`  -> ${(after / 1024).toFixed(1)}KB`);
        }
        totalBefore += before;
    }

    console.log(
        `\nDone. ${targets.length} files. ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(
            totalAfter /
            1024 /
            1024
        ).toFixed(1)}MB${dryRun ? " (dry run, nothing written)" : ""}`
    );
}

main();
