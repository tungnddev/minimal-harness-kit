---
description: Generate or update Claude project rules from a focused repository scan or verified Codex MHK guidance. Review content and native restrictions before writing.
argument-hint: "[migrate|fresh] [path]"
disable-model-invocation: true
---

<!-- Generated from adapters/claude/package/commands/rules.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

`/mhk:rules` owns the **derived layer** — selected guidance supported by code and current project policy: the CLAUDE.md rules block, the scoped `.claude/rules/*.md` files, the exemplar pointers, and the `permissions.deny` hard constraints. It is **idempotent**: run it on a fresh repo and it proposes the whole layer; run it again and it proposes evidence-backed corrections or concrete audit improvements; an unchanged, already-audited harness produces no diff. There is no separate create-vs-update command and nothing to initialize first.

Parse an optional `migrate` or `fresh` mode and target path from `$ARGUMENTS`; default to the current repository. Start with a shallow inventory of Claude guidance and whether root `AGENTS.md` or `.mhk/rules/` contains MHK output. Choose the source before scanning code:

| Situation | Behavior |
| --- | --- |
| Explicit `migrate` | Read `${CLAUDE_PLUGIN_ROOT}/references/codex-migration.md`; verify and import Codex guidance. If absent, report it. |
| Explicit `fresh` | Discover from repository sources while preserving existing Claude output and human policy. Do not import Codex output. |
| Owned Claude guidance exists, no mode | Recheck and update it; do not automatically import Codex changes. |
| Only Codex MHK guidance exists | Ask once: **Migrate and verify Codex rules (recommended)** or **Fresh scan**. Wait for the choice. |
| Neither platform has owned guidance | Fresh scan, retaining human guidance as policy/context. |

A mode choice is not approval to write. For fresh scans and ordinary reruns, invoke `repo-cartographer` read-only with the inventory and permitted sources below. Migration follows its selected source inventory and targeted verification instead of a full discovery scan. Keep `AGENTS.md`, overrides, `.codex/`, and `.mhk/` unchanged in every mode.

This command always operates on exactly one repo — a single service, app, or library. There is no monorepo fan-out; one repo gets one CLAUDE.md.

## What mhk owns vs what it must never touch

mhk manages **only what it can prove it created** — everything else is the user's and is preserved untouched. Ownership is signalled **in-band** (it travels with the file), so there is no side manifest or cache to keep honest.

### mhk blocks in `CLAUDE.md`

mhk writes to `CLAUDE.md` only inside its own marked blocks, and each block belongs to exactly one workflow:

| Block | Markers | Owner |
| --- | --- | --- |
| Rules | `<!-- mhk:rules:begin -->` … `<!-- mhk:rules:end -->` | `/mhk:rules` |
| Memory | `<!-- mhk:memory:begin -->` … `<!-- mhk:memory:end -->` | `/mhk:memory` |

- Write only your own block. Read the other mhk blocks as context, so you neither duplicate nor contradict them; never edit, reorder, or adopt their content.
- Everything outside mhk blocks is human-authored: preserve it, and read it as policy/context.
- Blocks keep this order: rules, then memory. Place a missing block after any mhk block that comes before it in this order, otherwise at the end of the file. Create `CLAUDE.md` if it does not exist.
- Validate your block's markers before writing. A duplicate, mixed, or unmatched pair is a conflict: stop and ask.
- The rules block's older markers — `<!-- mhk:managed:begin -->` … `<!-- mhk:managed:end -->` and `<!-- BEGIN: ai-guide -->` … `<!-- END: ai-guide -->` — still mark the rules block. Only the full rules workflow upgrades them, as a separately labelled line in its approved diff.

- **CLAUDE.md** — this command owns only the rules block. Never read human content or other mhk blocks as state to regenerate, and never modify them. If CLAUDE.md has no rules block, add one *alongside* the existing content (don't merge into it, don't overwrite the file).
- **Scoped `.claude/rules/*.md`** — a file mhk generates carries a trailing `<!-- mhk:generated -->` provenance marker (see `${CLAUDE_PLUGIN_ROOT}/templates/RULES_TEMPLATE.md`). Only propose changes to files that carry it. A rules file *without* the marker was hand-written: leave it alone, never overwrite or delete it.
- **Legacy markers** — the rules block's older markers (above) and the `<!-- mhk:generated - managed by /mhk:rules; edits may be overwritten -->` rules-file trailer still mark mhk-owned content. Whenever you propose changes to such a file, include upgrading its markers to the current `<!-- mhk:rules:begin -->` / `<!-- mhk:rules:end -->` and `<!-- mhk:generated -->` as a separately labelled line in the diff — never rewrite markers silently or without approval. A block must open and close with the same generation of marker; a mixed or unmatched pair is malformed — stop and ask.
- **`permissions.deny`** — only ever *append* entries; never remove one you didn't add, and never touch any other key in `.claude/settings.json`.

## Inventory before scanning

Read `CLAUDE.md`, `.claude/rules/`, and `.claude/settings.json` within the target repository. Validate rules-block marker pairs before using them; duplicate, malformed, or ambiguous blocks are an affected-file conflict. Build a numbered inventory of every managed command, rule, Unconfirmed entry, signpost, catalog row, exemplar, anti-exemplar, divergence-resolution comment, and existing deny restriction. Retain source file/item identity, filenames, ordering, scope, evidence, and human resolutions. Include marked rule files without signposts and signposts with missing targets. Memory is a separate layer. An older memory pointer inside the rules block (a Project memory subsection, or a line pointing at `.mhk/memory/MEMORY.md`) is inventoried so it can be removed once `CLAUDE.md` has a memory block; until then keep it unchanged. Memory content loaded into this session through the memory block is context, never evidence. Read unowned guidance as policy/context and label it unowned; never adopt it as generated state.

For discovery, pass this inventory explicitly to `repo-cartographer`, along with the target repository and allowed evidence: repository code, configuration, documentation, `CLAUDE.md`, and `.claude/rules/`. Exclude generated Codex guidance from fresh discovery; read human instructions as policy/context. Explicitly exclude `.mhk/memory/` and native personal memory stores, including linked reads and broad searches. If no owned Claude guidance exists, pass an empty owned inventory plus any human policy context. For migration, use the reference's import inventory alongside this destination inventory.

On reruns, require a `source` and `disposition` (`verified`, `correction`, `obsolete`, or `unresolved`) for every existing inventory item, with current evidence; additional discoveries are `new`. Check relevant sources without a usage census; retain explicit policy independently of adoption. Reconcile every inventory number before drafting: absence from a fresh scan is not evidence of obsolescence. Preserve verified content by default; the shared audit below may propose justified consolidation with item-to-destination accounting and approval. Preserve settled human decisions. If evidence is unavailable, report the item as unresolved rather than silently dropping it.

## Output particulars

- Use `${CLAUDE_PLUGIN_ROOT}/templates/CLAUDE_TEMPLATE.md` for the root block and `${CLAUDE_PLUGIN_ROOT}/templates/RULES_TEMPLATE.md` for detailed documents. Templates illustrate shape, not facts; include only useful sections. Keep `paths:` first and the exact `<!-- mhk:generated -->` trailer on owned topic files.
- Never write memory content or memory pointers: the memory block and `.mhk/memory/` belong to `/mhk:memory`; never inspect, write, or reorder the store during this workflow or its audit. If `CLAUDE.md` has no memory block, end the report with one line: team memory isn't set up — run `/mhk:memory`.
- When competing exemplar shapes require a project-intent decision, show representative paths and resolve that ambiguity with the user. Preserve a short in-band resolution beside the relevant exemplar or anti-exemplar, in the root or topic document that owns it. Never choose by a version-name suffix or re-ask a settled decision without materially changed evidence.
- Keep settings proposals separate from guidance. Create `.claude/settings.json` only for approved `permissions.deny` additions. After applying, verify JSON parses and existing settings and unowned content are preserved. Never commit generated output.

### Select and check

Use the cartographer's compact report to choose useful overview guidance. Keep the target repository read-only until approval. Reuse its sources; make targeted reads only where a consequential claim is unsupported or unclear. Do not repeat the scan or require a separate evidence/decision table.

Check that named paths, commands, and APIs have support. Preserve command working directories, prerequisites, and meaningful test limitations; distinguish inspection from execution. Keep observed preferences scoped, preserve explicit policy and known exceptions, and describe exemplars by the aspect they illustrate. Ask only for consequential missing information or project intent, respecting settled decisions. Omit weak new claims; account for unresolved existing items rather than silently dropping them.

### Render concise guidance

- Put the repository overview, useful commands, essential cross-cutting rules, and topic routing in the `CLAUDE.md` rules block. Omit unnecessary sections.
- Put scoped rules, compact reuse tables, and relevant exemplar pointers/wiring in `.claude/rules/<topic>.md`, translating applicability into `paths:`. Keep each detail in one home; leave implementation details in source code.
- Prefer a short instruction or purpose plus a source pointer. Retain policy provenance, settled choices, and exceptions that change its meaning. Omit confidence labels, counts, scan history, and routine evidence from coding context.
- Preserve useful existing wording, filenames, ordering, and human content. Explain corrections, consolidations, and proposed removals. Unchanged supported guidance should produce no diff; shortening is not permission to discard confirmed requirements.

For every `.claude/rules/` document, add a one-line signpost under `### Reuse before building new` in `CLAUDE.md`. Use the finding's `task` and `summary` to make its relevance clear during planning and file creation, before a matching read loads the scoped document. Keep the detail in that document.

For example:

```
- UI: reuse the shared widget/dialog catalog before building new ones — see .claude/rules/ui-catalog.md
```

Keep short, consequential guardrails discoverable in the root even when their details live in a scoped document. Where possible, combine the guardrail and signpost in one line instead of adding a duplicate rule above it. Preserve applicability; visibility must not turn a scoped requirement into a global one. Mention relevant exemplars in the topic's signpost when needed for planning.

For every hard-constraint finding, retain its instructional rule and separately propose `permissions.deny` additions in `.claude/settings.json`. Translate the reported operation into `Read(./<glob>)` and/or `Edit(./<glob>)` only where those tools match the intended restriction. Report unsupported operations rather than pretending a tool-specific entry enforces them. Only append entries and preserve other settings. Present this configuration diff separately for explicit approval.

### Review and apply

Read the root and topic documents together before approval, including relevant human guidance. Check working pointers, supported wording, important exceptions, obvious contradictions, and duplicate meaning. Consider ordinary work and new-file creation: can the agent find the necessary guidance without unrelated documents? Keep this a brief review, not a full application audit or mandatory task-size report.

Check root signposts for planning/new files and overlapping `paths:` for ordinary edits, including unscoped rules. Narrow irrelevant loading only where applicability supports it; a consumer catalog must remain visible to callers. Report important loading gaps without introducing another reference directory.

Resolve concrete problems and recheck affected content. Present the complete proposed content or diff for every affected file, including new topics, with a short summary of meaningful changes, retained decisions, and limitations. Obtain the required content and separate native-configuration approvals. After partial approval, ensure accepted links and instructions remain consistent; obtain approval for any revised proposal before writing.

Read back applied files against the approved content. Check markers/frontmatter, links, and platform-specific preservation/configuration requirements. Report mismatches rather than silently changing approved content. Keep working notes temporary, outside the target repository.

Label the final diffs by file/type (`CLAUDE.md`, rules, settings). This command runs only on explicit invocation. The written files are the whole state; no audit log, cache, or version stamp is written into the target repository.
