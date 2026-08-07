---
description: Scan this repo and propose its CLAUDE.md, .claude/rules/*.md (cross-cutting-by-filetype conventions and reuse-surface catalogs, each signposted from CLAUDE.md), and permissions.deny additions for hard constraints — containing only project-specific rules.
argument-hint: "[path]"
---

Use the `repo-cartographer` subagent to scan `${ARGUMENTS:-the current repository}` read-only and return its structured report: repo fingerprint, delta-rule candidates with evidence, reuse-surface catalog candidates, cross-cutting-by-filetype candidates, and hard-constraint candidates.

This command always operates on exactly one repo — a single service, app, or library. There is no root/monorepo fan-out; one repo gets one CLAUDE.md.

Then, using that report:

1. If `CLAUDE.md` already exists, preserve everything outside `<!-- BEGIN: ai-guide --> … <!-- END: ai-guide -->` markers. Only the managed block is ever proposed for replacement — never touch content outside it. For `.claude/rules/*.md` files, propose the whole file each time instead of using markers — they're small and single-topic, and frontmatter (`paths:`) must stay the literal first thing in the file, so it can't be wrapped in a marker comment the way CLAUDE.md's body can. For `.claude/settings.json`, only propose additions to the `permissions.deny` array itself, leaving every other key in the file untouched.

2. Draft the CLAUDE.md managed block. See `${CLAUDE_PLUGIN_ROOT}/templates/CLAUDE_TEMPLATE.md` for the target shape and length. Include a one-paragraph description of what the repo is/does, its real commands, and ONLY the `confidence: high` rule candidates. List `confidence: medium` candidates separately under a clearly marked "unconfirmed — verify" heading, never merged into the main rules list. For every path-scoped `.claude/rules/` file you draft in step 3, add a **one-line signpost** here pointing to it (e.g. `- UI: reuse the shared widget/dialog catalog before building new ones — see .claude/rules/ui-catalog.md`). The signpost matters because a scoped rule's body loads only when Claude reads a matching file — never during planning, and never when Claude *creates* a new file — so without the always-loaded pointer the rule is invisible exactly when a plan is being formed or a new file placed. Keep the whole block under ~80 lines; signposts are one line each, not a copy of the rule.

3. Draft the path-scoped `.claude/rules/<topic>.md` files, each with `paths:` frontmatter set to the proposed glob(s). See `${CLAUDE_PLUGIN_ROOT}/templates/RULES_TEMPLATE.md` for shape. Two kinds land here:
   - **Cross-cutting-by-filetype rules** — constraints that apply to a file *pattern* wherever it occurs (e.g. generated code, migrations).
   - **Reuse-surface catalogs** — the shared internal API surface (design-system widgets, shared dialogs/hooks, helper extensions, base classes, client wrappers) as a compact `| name | purpose | where |` lookup table, scoped (via `paths:`) to where those are *consumed*. Never paste code skeletons — a frozen skeleton drifts from the code and starts lying; a name + a pointer to the canonical file does not.
   Only create a file when the cartographer actually surfaced a candidate of that kind — don't manufacture one just to have an example. For each file, also add its CLAUDE.md signpost line per step 2.

4. Draft `permissions.deny` additions for each hard-constraint candidate, as a proposed edit to `.claude/settings.json` (creating the file with just a `permissions.deny` array if it doesn't exist). Present this as its own clearly labeled part of the diff, separate from the CLAUDE.md/rules content — it changes enforced behavior, not just documentation, so it deserves its own explicit approval rather than being bundled in with everything else.

5. Present the complete proposed diff — every file, clearly separated and labeled by type (CLAUDE.md / rules / settings.json) — to the user. Do not write anything yet. Wait for the user to approve, edit, or reject specific files or individual rules.

6. On approval, write only what was approved. Then write/update `.mhk/repo-map.yaml` (shape documented in `${CLAUDE_PLUGIN_ROOT}/schema/repo-map-schema.md`) as a build-time cache so a future `/mhk:sync` run can diff incrementally instead of rescanning from scratch. This file is a cache for the generator tooling only — it is never something Claude needs to load in normal sessions.

This command only runs on explicit invocation — never trigger this flow automatically from other work.
