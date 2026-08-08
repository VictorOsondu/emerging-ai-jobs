import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function scalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseFrontMatter(contents, filename) {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    throw new Error(`${filename}: missing YAML front matter`);
  }

  const metadata = {};
  let listKey = null;
  for (const rawLine of match[1].split(/\r?\n/)) {
    const keyMatch = rawLine.match(/^([a-z_]+):(?:\s*(.*))?$/);
    if (keyMatch) {
      const [, key, value = ""] = keyMatch;
      if (value === "") {
        metadata[key] = [];
        listKey = key;
      } else {
        metadata[key] = scalar(value);
        listKey = null;
      }
      continue;
    }

    const itemMatch = rawLine.match(/^\s{2}-\s+(.+)$/);
    if (itemMatch && listKey) {
      metadata[listKey].push(scalar(itemMatch[1]));
      continue;
    }

    if (rawLine.trim()) {
      throw new Error(`${filename}: unsupported front-matter line: ${rawLine}`);
    }
  }

  return { metadata, body: contents.slice(match[0].length) };
}

export function readProfiles() {
  const profiles = [];
  for (const directory of ["jobs", "evolutions"]) {
    const absoluteDirectory = path.join(root, directory);
    if (!fs.existsSync(absoluteDirectory)) continue;

    for (const filename of fs.readdirSync(absoluteDirectory).filter((name) => name.endsWith(".md")).sort()) {
      const relativePath = path.posix.join(directory, filename);
      const contents = fs.readFileSync(path.join(root, relativePath), "utf8");
      const { metadata, body } = parseFrontMatter(contents, relativePath);
      profiles.push({ metadata, body, relativePath });
    }
  }
  return profiles;
}

export function readEvidence() {
  return JSON.parse(fs.readFileSync(path.join(root, "data/evidence.json"), "utf8"));
}

export function displayValue(value) {
  const special = {
    "ai-native": "AI-native",
    "ai-assisted": "AI-assisted",
    "ai-augmented": "AI-augmented",
    "ai-first": "AI-first",
    "agent-supervised": "Agent-supervised",
    "early-signal": "Early signal"
  };
  return special[value] ?? value.charAt(0).toUpperCase() + value.slice(1).replaceAll("-", " ");
}

export function replaceGeneratedSection(contents, name, generated) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(contents)) {
    throw new Error(`Missing generated-section markers for ${name}`);
  }
  return contents.replace(pattern, `${start}\n${generated.trim()}\n${end}`);
}
