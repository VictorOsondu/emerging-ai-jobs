import fs from "node:fs";
import path from "node:path";
import {
  displayValue,
  readEvidence,
  readProfiles,
  replaceGeneratedSection,
  root
} from "./catalogue-lib.mjs";

const checkOnly = process.argv.includes("--check");
const profiles = readProfiles();
const evidenceData = readEvidence();
const profileById = new Map(profiles.map((profile) => [profile.metadata.id, profile]));

function profileTable(profileType) {
  const selected = profiles
    .filter((profile) => profile.metadata.profile_type === profileType)
    .sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));

  const header = "| Role | Origin | Operating model | Maturity | Confidence | Profile |\n| --- | --- | --- | --- | --- | --- |";
  const rows = selected.map(({ metadata, relativePath }) =>
    `| ${metadata.title} | ${displayValue(metadata.role_origin)} | ${displayValue(metadata.operating_model)} | ${displayValue(metadata.maturity)} | ${displayValue(metadata.confidence)} | [View](${relativePath}) |`
  );
  return [header, ...rows].join("\n");
}

const catalogueSection = [
  "### AI-Native and Hybrid Roles",
  "",
  profileTable("role-profile"),
  "",
  "### Evolving Occupations",
  "",
  profileTable("occupation-evolution")
].join("\n");

const typeLabels = {
  "primary-job-posting": "Primary job posting",
  "recruiter-job-posting": "Recruiter job posting",
  "primary-commissioned-research": "Primary commissioned research",
  "primary-public-guidance": "Primary public guidance",
  "secondary-practitioner-source": "Secondary practitioner source"
};

function evidenceTable() {
  const header = "| ID | Profiles | Public evidence | Type | Geography | Status | Verified | What it supports |\n| --- | --- | --- | --- | --- | --- | --- | --- |";
  const rows = evidenceData.evidence.map((record) => {
    const roles = record.role_ids.map((id) => {
      const profile = profileById.get(id);
      return `[${profile.metadata.title}](${profile.relativePath})`;
    }).join(", ");
    const archive = record.archive_url ? ` ([archive](${record.archive_url}))` : "";
    return `| ${record.id} | ${roles} | ${record.publisher}, [${record.title}](${record.url})${archive} | ${typeLabels[record.evidence_type] ?? record.evidence_type} | ${record.geography} | ${displayValue(record.status)} | ${record.last_verified_at} | ${record.supports} |`;
  });
  return [header, ...rows].join("\n");
}

const targets = [
  { filename: "README.md", section: "catalogue", generated: catalogueSection },
  { filename: "sources.md", section: "evidence", generated: evidenceTable() }
];

const auditDate = evidenceData.last_audited_at;

function syncDates(contents) {
  return contents
    .replace(/last%20updated-\d{4}--\d{2}--\d{2}/, `last%20updated-${auditDate.replaceAll("-", "--")}`)
    .replace(/Last reviewed: \d{4}-\d{2}-\d{2}\./, `Last reviewed: ${auditDate}.`);
}

let stale = false;
for (const target of targets) {
  const absolutePath = path.join(root, target.filename);
  const original = fs.readFileSync(absolutePath, "utf8");
  const rendered = syncDates(replaceGeneratedSection(original, target.section, target.generated));
  if (rendered === original) continue;
  if (checkOnly) {
    console.error(`${target.filename} is not up to date; run node scripts/render-catalogue.mjs`);
    stale = true;
  } else {
    fs.writeFileSync(absolutePath, rendered);
    console.log(`Updated ${target.filename}`);
  }
}

if (stale) process.exitCode = 1;
