#!/usr/bin/env node
/**
 * Design-system guard. Fails (exit 1) when code bypasses the shared UI system
 * described in DESIGN.md. Runs in CI and via `npm run check:design`.
 *
 * Rules
 *  1. No native <select>: use ComboBox (components/combo-box.tsx).
 *  2. No window.confirm / prompt / alert: use useConfirmations().
 *  3. No hard-coded colours (hex, rgb/rgba, hsl) in TS/TSX: use design tokens
 *     via design-system classes or var(--ds-*).
 *  4. app/globals.css is legacy and frozen: it may shrink, never grow.
 *     New styles belong in app/design-system.css.
 *  5. Every page uses a shared frame (PatientShell, AuthLayout or SiteHeader)
 *     so navigation and layout stay consistent.
 *  6. Only one logo: no <img> of /logo.png and no hand-built brand marks;
 *     use components/brand.tsx.
 *
 * To allow a deliberate exception on one line, add a comment containing
 * `design-system-ignore` with a short reason on that line.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SOURCE_DIRS = ["app", "components", "contexts", "lib"];
// Byte size of app/globals.css when it was frozen. Lower this when you prune it.
const GLOBALS_CSS_MAX_BYTES = 23_000;
const FRAME_IMPORTS = ["@/components/patient-shell", "@/components/auth/auth-layout", "@/components/site-header", "@/components/auth/login-form", "@/components/auth/signup-form"];
// Files that legitimately contain raw colours (the colour source of truth or generated assets).
const COLOUR_ALLOWLIST = new Set(["app/layout.tsx"]);

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const problems = [];
const report = (file, line, rule, text) => problems.push({ file: path.relative(root, file), line, rule, text: text.trim().slice(0, 140) });

const files = SOURCE_DIRS.flatMap((dir) => walk(path.join(root, dir)));
for (const file of files) {
  const rel = path.relative(root, file);
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (line.includes("design-system-ignore")) return;
    const code = line.replace(/\/\/.*$/, "");
    const n = index + 1;
    if (/<select[\s>]/.test(code)) report(file, n, "Use <ComboBox> instead of a native <select>", line);
    if (/\bwindow\.(confirm|prompt|alert)\s*\(|(^|[^.\w])(confirm|prompt|alert)\s*\(/.test(code) && !/openConfirmModal|useConfirmations/.test(code)) {
      report(file, n, "Use useConfirmations().openConfirmModal instead of browser dialogs", line);
    }
    if (!COLOUR_ALLOWLIST.has(rel) && /\.tsx?$/.test(rel)) {
      const colour = code.match(/["'`(:\s](#[0-9a-fA-F]{3,8})\b|\brgba?\(\s*\d|\bhsla?\(\s*\d/);
      if (colour && !/href=["']#|#main-content|#[a-z-]+["']\s*\}/.test(code)) report(file, n, "Use design tokens (var(--ds-*)) instead of hard-coded colours", line);
    }
    if (/src=["'`]\/logo\.png/.test(code)) report(file, n, "Use <Brand /> from components/brand.tsx for the logo", line);
  });
}

// Rule 4: globals.css is frozen.
const globalsPath = path.join(root, "app/globals.css");
const globalsBytes = fs.existsSync(globalsPath) ? fs.statSync(globalsPath).size : 0;
if (globalsBytes > GLOBALS_CSS_MAX_BYTES) {
  problems.push({ file: "app/globals.css", line: 0, rule: `globals.css is frozen legacy CSS (${globalsBytes} bytes > ${GLOBALS_CSS_MAX_BYTES}). Add styles to app/design-system.css instead`, text: "" });
}

// Rule 5: every page uses a shared frame.
for (const file of files.filter((f) => /app\/(.+\/)?page\.tsx$/.test(path.relative(root, f)))) {
  const source = fs.readFileSync(file, "utf8");
  if (source.includes("design-system-ignore")) continue;
  if (!FRAME_IMPORTS.some((imp) => source.includes(`"${imp}"`))) {
    report(file, 1, "Pages must use PatientShell, AuthLayout or SiteHeader (see DESIGN.md › Layouts)", "");
  }
}

if (problems.length) {
  console.error(`\n✗ Design-system check failed (${problems.length} issue${problems.length === 1 ? "" : "s"}). See DESIGN.md.\n`);
  for (const p of problems) console.error(`  ${p.file}${p.line ? `:${p.line}` : ""}  ${p.rule}${p.text ? `\n      ${p.text}` : ""}`);
  console.error("");
  process.exit(1);
}
console.log(`✓ Design-system check passed (${files.length} files, globals.css ${globalsBytes}/${GLOBALS_CSS_MAX_BYTES} bytes).`);
