import fs from "node:fs";
import path from "node:path";
import { displayValue, readEvidence, readProfiles, root } from "./catalogue-lib.mjs";

const errors = [];
const requiredMetadata = [
  "id",
  "title",
  "profile_type",
  "role_origin",
  "operating_model",
  "maturity",
  "confidence",
  "reviewed_at",
  "evidence"
];
const allowed = {
  profile_type: new Set(["role-profile", "occupation-evolution"]),
  role_origin: new Set(["existing", "hybrid", "ai-native"]),
  operating_model: new Set(["ai-assisted", "ai-augmented", "ai-first", "agent-supervised"]),
  maturity: new Set(["emerging", "formalising", "established"]),
  confidence: new Set(["early-signal", "medium", "high"])
};
const requiredHeadings = {
  "role-profile": [
    "Role Summary",
    "Why This Role Is Emerging Now",
    "Classification",
    "Core Responsibilities",
    "Common Tools",
    "Required Skills",
    "Adjacent Existing Roles",
    "What This Role Is Not",
    "Example Job Titles",
    "Example Work Outputs",
    "Risks and Failure Modes",
    "Public Signals"
  ],
  "occupation-evolution": [
    "Evolution Summary",
    "Why the Work Is Changing Now",
    "Classification",
    "Evolution of the Workflow",
    "Tasks Increasing in Importance",
    "Tasks Decreasing or Being Delegated",
    "New Skills and Judgement",
    "Tools and Systems",
    "Measures of Good Work",
    "Human Accountability",
    "Transition Path",
    "Risks and Failure Modes",
    "Public Signals"
  ]
};

function error(message) {
  errors.push(message);
}

function ageInDays(dateString) {
  return Math.floor((Date.now() - new Date(`${dateString}T00:00:00Z`).getTime()) / 86_400_000);
}

const profiles = readProfiles();
const profileById = new Map();
for (const profile of profiles) {
  const { metadata, body, relativePath } = profile;
  for (const key of requiredMetadata) {
    if (metadata[key] === undefined || metadata[key] === "" || (Array.isArray(metadata[key]) && metadata[key].length === 0)) {
      error(`${relativePath}: missing ${key}`);
    }
  }

  if (profileById.has(metadata.id)) error(`${relativePath}: duplicate id ${metadata.id}`);
  profileById.set(metadata.id, profile);

  if (path.basename(relativePath, ".md") !== metadata.id) {
    error(`${relativePath}: filename must match id ${metadata.id}`);
  }
  for (const [key, values] of Object.entries(allowed)) {
    if (!values.has(metadata[key])) error(`${relativePath}: invalid ${key} ${metadata[key]}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.reviewed_at)) {
    error(`${relativePath}: reviewed_at must use YYYY-MM-DD`);
  } else if (ageInDays(metadata.reviewed_at) > 100) {
    error(`${relativePath}: profile review is more than 100 days old`);
  }

  const headings = new Set([...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]));
  for (const heading of requiredHeadings[metadata.profile_type] ?? []) {
    if (!headings.has(heading)) error(`${relativePath}: missing heading "${heading}"`);
  }

  const classifications = [
    ["Role origin", metadata.role_origin],
    ["Operating model", metadata.operating_model],
    ["Maturity", metadata.maturity],
    ["Confidence", metadata.confidence]
  ];
  for (const [label, value] of classifications) {
    if (!body.includes(`- ${label}: ${displayValue(value)}`)) {
      error(`${relativePath}: body ${label.toLowerCase()} does not match front matter`);
    }
  }
}

const evidenceData = readEvidence();
if (evidenceData.schema_version !== 1) error("data/evidence.json: unsupported schema_version");
if (!/^\d{4}-\d{2}-\d{2}$/.test(evidenceData.last_audited_at)) {
  error("data/evidence.json: last_audited_at must use YYYY-MM-DD");
} else if (ageInDays(evidenceData.last_audited_at) > 45) {
  error("data/evidence.json: evidence audit is more than 45 days old");
}

const evidenceById = new Map();
const evidenceFields = [
  "id",
  "role_ids",
  "publisher",
  "title",
  "evidence_type",
  "geography",
  "url",
  "observed_at",
  "last_verified_at",
  "status",
  "supports"
];
const statuses = new Set(["active", "closed", "moved", "unavailable", "historical", "changed"]);

for (const record of evidenceData.evidence) {
  for (const field of evidenceFields) {
    if (record[field] === undefined || record[field] === "" || (Array.isArray(record[field]) && record[field].length === 0)) {
      error(`data/evidence.json: ${record.id ?? "unknown record"} missing ${field}`);
    }
  }
  if (evidenceById.has(record.id)) error(`data/evidence.json: duplicate id ${record.id}`);
  evidenceById.set(record.id, record);
  if (!statuses.has(record.status)) error(`data/evidence.json: ${record.id} has invalid status ${record.status}`);
  if (!record.url.startsWith("https://")) error(`data/evidence.json: ${record.id} URL must use HTTPS`);
  for (const field of ["observed_at", "last_verified_at"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record[field])) error(`data/evidence.json: ${record.id} ${field} must use YYYY-MM-DD`);
  }
  if (record.status === "active" && /^\d{4}-\d{2}-\d{2}$/.test(record.last_verified_at) && ageInDays(record.last_verified_at) > 45) {
    error(`data/evidence.json: active source ${record.id} was not verified in the last 45 days`);
  }
  for (const roleId of record.role_ids) {
    if (!profileById.has(roleId)) error(`data/evidence.json: ${record.id} references unknown role ${roleId}`);
  }
}

for (const profile of profiles) {
  const { metadata, relativePath } = profile;
  for (const evidenceId of metadata.evidence) {
    const record = evidenceById.get(evidenceId);
    if (!record) {
      error(`${relativePath}: unknown evidence id ${evidenceId}`);
    } else if (!record.role_ids.includes(metadata.id)) {
      error(`${relativePath}: evidence ${evidenceId} does not point back to ${metadata.id}`);
    }
  }

  if (metadata.confidence === "high") {
    const activePrimaryPublishers = new Set(metadata.evidence
      .map((id) => evidenceById.get(id))
      .filter((record) => record?.status === "active" && record.evidence_type.startsWith("primary-"))
      .map((record) => record.publisher));
    if (activePrimaryPublishers.size < 2) {
      error(`${relativePath}: high confidence requires two independent active primary sources`);
    }
  }
}

const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const profile of profiles) {
  if (!readme.includes(`(${profile.relativePath})`)) error(`README.md: missing ${profile.relativePath}`);
}

if (errors.length) {
  for (const message of errors) console.error(`ERROR: ${message}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${profiles.length} profiles and ${evidenceData.evidence.length} evidence records.`);
}
