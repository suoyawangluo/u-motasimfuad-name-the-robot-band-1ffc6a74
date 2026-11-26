// Name the Robot Band — u-motasimfuad-name-the-robot-band-1ffc6a74
// Entry: one funny name for a band made of robots, plus a few words on
// its hit song, all under 200 characters. The program is deterministic:
// the same text is produced on every run, and the entry text below is
// the only content that reaches the judge.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// The entry, assembled from its named parts so each beat can be read
// on its own. The band name is a real-sounding robot band; the hit
// song line turns the band's defining flaw — an endless loop — into
// the love song it cannot escape.
const PARTS = {
  band: "The Infinite Loops",
  separator: " — hit single ",
  song: "'While (True) I Love You'",
  closer: ".",
} as const;

function buildEntry(): string {
  return `${PARTS.band}${PARTS.separator}${PARTS.song}${PARTS.closer}`;
}

type GateReport = {
  ok: boolean;
  characters: number;
  lines: number;
  sha256: string;
};

function validateEntry(text: string): GateReport {
  const characters = [...text].length;
  const lines = text.split("\n").length;
  const sha256 = createHash("sha256").update(text, "utf8").digest("hex");
  const ok =
    characters >= 1 &&
    characters <= 200 &&
    lines === 1 &&
    text.trim().length > 0;
  return { ok, characters, lines, sha256 };
}

function verifyWritten(file: string, expected: string): string {
  const written = readFileSync(file, "utf8");
  if (written !== expected) {
    throw new Error("verify: written entry differs from the built entry");
  }
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const entry = buildEntry();
  const report = validateEntry(entry);
  if (!report.ok) {
    throw new Error(
      `gate: ${report.characters} characters, ${report.lines} lines — must be 1-200 characters, one line`,
    );
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, "entry.txt");
  writeFileSync(file, entry, "utf8");
  const writtenSha = verifyWritten(file, entry);
  if (writtenSha !== report.sha256) {
    throw new Error("verify: sha mismatch after write");
  }
  console.log(
    `gate passes: ${report.characters} characters, ${report.lines} line, sha256 ${writtenSha}`,
  );
}

main();
