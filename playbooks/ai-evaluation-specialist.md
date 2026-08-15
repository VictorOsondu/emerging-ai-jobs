# AI Evaluation Specialist Playbook

A practical operating guide for the role defined in [jobs/ai-evaluation-specialist.md](../jobs/ai-evaluation-specialist.md). The profile answers "what is this role?"; this playbook covers how to become useful in it, hire for it, and stand up the function.

Evidence basis: two current specialist postings and one historical observation ([EVAL-01, EVAL-02, and EVAL-03](../sources.md#evidence-register)), which meets the [playbook evidence rule](README.md#evidence-rule).

## First 30 Days in the Role

- Map every AI surface the organisation ships: models, prompts, retrieval, agents, and the teams that own them.
- Collect what already exists: ad-hoc test sets, vibe-check rituals, dashboards, incident reports, and user complaints.
- Pick the single highest-risk AI behaviour and build a small, honest eval for it end to end: dataset, rubric, scoring, report.
- Establish a baseline before proposing changes; a number nobody disputes beats a framework nobody uses.
- Meet the people who see failures first: support, moderation, sales engineering, and the on-call rotation.
- Agree with product and engineering leadership on what a launch-blocking evaluation result means and who decides.

## Key Decisions Owned

- What gets measured, on which datasets, against which rubrics.
- When automated scoring (including LLM-as-judge) is trusted and when human review is required.
- Which quality regressions block a launch or rollback a change.
- How eval datasets are refreshed as product usage and models change.
- What counts as a reportable AI quality incident.

## Stakeholders

- product managers who own the AI features being measured
- engineers and ML engineers who ship the changes evals gate
- domain experts who define what a good answer is
- trust and safety, legal, and compliance for high-stakes behaviours
- leadership, who consume quality trends and launch recommendations
- support and operations, who surface real-world failures

## Operating Rhythm

- Per change: regression evals run in CI or pre-release, with results attached to the release decision.
- Weekly: review production samples and new failure modes; triage into the eval backlog.
- Monthly: refresh datasets against current usage; report quality trends to leadership.
- Quarterly: re-derive the failure-mode taxonomy and retire stale evals; audit LLM-as-judge agreement against human review.

## Metrics That Matter

- regression catch rate: quality problems found before release versus reported from production
- agreement between automated scores and expert human judgement
- coverage: share of shipped AI behaviours with a maintained eval
- time from new failure mode observed to eval added
- launch decisions actually informed by evaluation results, not overridden silently

## Starter Toolkit

- an eval harness wired into the deployment pipeline
- a versioned golden dataset with provenance for every example
- rubrics written so two reviewers score alike without discussion
- tracing or observability on production AI calls for sampling
- an annotation workflow with calibration rounds for human reviewers
- a red-team test set for the behaviours that must never ship broken

## Interview Questions

- "Walk me through an eval you built that changed a launch decision. What did it measure and what did it miss?"
- "When would you not trust LLM-as-judge scoring, and what would you do instead?"
- "A model update improves your headline metric but support tickets rise. What do you do?"
- "How do you keep a golden dataset honest once the product's real usage drifts?"
- "Design a minimal eval for [the company's actual AI feature] in ten minutes."

## Portfolio or Project Examples

- a published eval suite for an open model or popular AI product, with rubric and results
- a failure-mode taxonomy derived from real production or public incident data
- a before/after write-up showing a regression caught and fixed
- an LLM-as-judge calibration study against human raters
- a red-team report with reproducible prompts and severity ratings

## Hiring Red Flags

- portfolio is only contractor response-rating work with no test design of their own
- reports accuracy numbers without dataset provenance or confidence
- treats evaluation as a one-off pre-launch gate rather than a continuous system
- cannot describe a case where their measurement was wrong and how they found out
- reaches for a leaderboard when the question is about a specific product behaviour

## How the Role Changes by Company Size

- **Startup**: one person embedded in product engineering; pragmatic evals on the riskiest flows; the win is stopping obvious regressions cheaply.
- **Scale-up**: a small team owning shared harnesses, datasets, and review workflows across features; the win is consistency and coverage.
- **Enterprise**: a quality function tied into governance, risk, and compliance; evaluation evidence feeds audits and model-approval processes; the win is defensibility as well as quality.
