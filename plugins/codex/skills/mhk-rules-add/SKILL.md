---
name: mhk-rules-add
description: Verify and add a user-supplied project rule to AGENTS.md or .mhk/rules. Use only when explicitly invoked; no full repository scan.
---

<!-- Generated from adapters/codex/package/skills/mhk-rules-add/SKILL.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

# Add a Codex project rule

Use the rule text supplied with `$mhk-rules-add`. Read root `AGENTS.md`, any `AGENTS.override.md`, and relevant `.mhk/rules/` documents. Check selected instructions on the path to the affected work: an override can hide the root index or supersede the rule. Report the conflict without editing overrides or claiming the new rule will be loaded.

## Input → verify → add

Use the supplied rule text and optional topic/path. If the text is missing, ask for it. Work in one repository; do not follow paths outside it. Skip the cartographer and full-repository scan.

Read the root guidance and relevant topic files to check ownership, duplicates, and conflicts. Verify referenced paths, APIs, or commands with targeted source reads. Distinguish a code fact from a user-defined policy: a new policy may intentionally differ from current code, so record its authority and note the conflict instead of rejecting it for low adoption. Omit generic advice that adds no project-specific meaning. Resolve only consequential ambiguity; do not invent evidence or silently override an existing decision.

If the rule already exists, point to it and make no change. Otherwise keep the user's meaning and scope in a short instruction. Prefer an existing owned topic when it fits; use the root rules block for a cross-cutting rule, or a new focused topic when useful. Do not create an unrelated repository overview. Preserve existing wording and ordering except for the proposed change.

### mhk blocks in `AGENTS.md`

mhk writes to `AGENTS.md` only inside its own marked blocks, and each block belongs to exactly one workflow:

| Block | Markers | Owner |
| --- | --- | --- |
| Rules | `<!-- mhk:rules:begin -->` … `<!-- mhk:rules:end -->` | `$mhk-rules` |
| Memory | `<!-- mhk:memory:begin -->` … `<!-- mhk:memory:end -->` | `$mhk-memory` |

- Write only your own block. Read the other mhk blocks as context, so you neither duplicate nor contradict them; never edit, reorder, or adopt their content.
- Everything outside mhk blocks is human-authored: preserve it, and read it as policy/context.
- Blocks keep this order: rules, then memory. Place a missing block after any mhk block that comes before it in this order, otherwise at the end of the file. Create `AGENTS.md` if it does not exist.
- Validate your block's markers before writing. A duplicate, mixed, or unmatched pair is a conflict: stop and ask.
- The rules block's older markers — `<!-- mhk:managed:begin -->` … `<!-- mhk:managed:end -->` and `<!-- BEGIN: ai-guide -->` … `<!-- END: ai-guide -->` — still mark the rules block. Only the full rules workflow upgrades them, as a separately labelled line in its approved diff.

On this fast path, write only inside the rules block; if it is absent, propose a minimal one. Preserve older rules-block markers here instead of upgrading them.

Topic files under `.mhk/rules/` must start with `paths:` frontmatter and end with `<!-- mhk:generated -->`. Recognize the legacy `<!-- mhk:generated - managed by /mhk:rules; edits may be overwritten -->` trailer as owned; preserve it on existing files. Never overwrite an unmarked topic; use a non-colliding destination or resolve the conflict. Keep scopes accurate and preserve other rules.

For every `.mhk/rules/` document, add a row to the `### Detailed rules and catalogs` table in `AGENTS.md`: the finding's `task` (including creating new files), optional path predicate from `applies_to`, specific coverage from `summary`, and a direct relative link.

For example:

```
| Creating or editing UI/presentation code — screens, widgets, dialogs (`**/presentation/**`) | shared design-system widgets, dialogs, list views, and formatters to reuse | [ui-catalog](.mhk/rules/ui-catalog.md) |
```

Tell Codex to read matching documents during planning and before creating or editing files, without opening every document on every task. These files are not loaded automatically; the index is their retrieval route. A short consequential guardrail can live in the relevant row instead of being repeated above the table. Preserve its scope, and identify any relevant exemplar in the coverage column.

Show the exact proposed diff or complete new content, including any root routing change, and a brief verification result or limitation. Wait for content approval; the initial rule text is not approval of wording or placement. Before writing, recheck the affected sources and destinations; if changed, revise the proposal for approval. After applying, compare with approved content and check markers, frontmatter, links, and preservation of human text. Never commit. This fast path changes guidance only, not native settings or memory.

Keep `CLAUDE.md`, `.claude/`, `.codex/`, and `.mhk/memory/` unchanged. Never read personal memory stores. `.mhk/rules/` documents are retrieved through the root index, not loaded automatically by their paths. If enforcement is requested, explain that it requires the separate native-configuration review in `$mhk-rules`; do not silently start it.
