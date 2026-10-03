---
name: mhk-rules
description: Generate or update a repository's Codex AGENTS.md and .mhk/rules from a verified Claude mhk harness or a fresh code scan. Use only when explicitly invoked to manage project rules.
---

<!-- Generated from adapters/codex/package/skills/mhk-rules/SKILL.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

# mhk rules for Codex

Build one repository's small, evidence-backed Codex harness: a rules block in root `AGENTS.md` plus focused `.mhk/rules/*.md` documents, and — separately — native permission proposals. Operate only on explicit invocation.

## 1. Resolve the target

Resolve the target from the invocation, otherwise the current Git repository. A module or package path inside a repository still belongs to that repository's single harness. Never span multiple repositories. Do not follow a rule file, symlink, or link that resolves outside the target; report the boundary instead.

## 2. Shallow inventory (read-only, no deep scan yet)

Read, without scanning application code:

- root `AGENTS.md` and `AGENTS.override.md`;
- `.mhk/rules/` and which files carry the exact `<!-- mhk:generated -->` marker;
- `CLAUDE.md` (and whether it has an mhk rules block: `<!-- mhk:rules:begin -->`, or an older `<!-- mhk:managed:begin -->` or `<!-- BEGIN: ai-guide -->`), `.claude/rules/`, `.claude/settings.json`;
- `.codex/config.toml`.

**Record the contents** (or a cryptographic digest) and existence of every file you read here and every destination you may write, including destinations that do not exist yet. Extend this record as verification reads additional sources or identifies destinations. You will compare against it before applying, to detect concurrent changes.

## 3. Choose the source

| Situation | Behavior |
| --- | --- |
| User explicitly requested `migrate` | Follow [migration.md](references/migration.md). If the Claude sources are missing, report that; do not invent a migration. |
| User explicitly requested `fresh` | Follow [repo-cartographer.md](references/repo-cartographer.md). Preserve human guidance and ownership boundaries. |
| Owned Codex output exists, no mode requested | Re-verify and converge it with the [repo-cartographer.md](references/repo-cartographer.md) method. Do not automatically import later Claude changes. |
| Claude mhk output exists, owned Codex output does not | Ask once, before any deep analysis: **Migrate and verify existing Claude rules (recommended)** or **Fresh scan with Codex**. Wait for the answer. |
| Neither exists | Fresh scan. |
| Only human-authored guidance exists | Treat it as policy and context. Fresh scan, adding owned output alongside it where safe. |

"Migrate and verify" is recommended because it starts from a curated inventory; it is still the user's choice. An explicit mode in the invocation means do not ask again. **Choosing a mode is not approval to write its output.**

A clean Claude harness or a clean doctor result on either platform is not verification. The doctors check surface health only.

Fresh scans must work with no Claude files present and no Claude plugin installed.

## 4. Workflow after selection

1. Load the selected reference and each playbook in `references/playbooks/` that matches a live package.
   Before verification and review, establish the protected-path baseline below.
2. Verify (migration) or discover (scan) candidates read-only, producing the working report defined in [repo-cartographer.md](references/repo-cartographer.md). Read-only is an instruction here, not a tool-enforced sandbox; do not claim isolation.
3. Resolve ambiguities that affect canonical exemplars, policies, or conflicting output (competing exemplar clusters, unresolved migration items).
4. Apply the shared candidate verification/selection contract (§5), then draft the root block from [AGENTS_TEMPLATE.md](assets/AGENTS_TEMPLATE.md) and detailed documents from [RULES_TEMPLATE.md](assets/RULES_TEMPLATE.md). Templates show shape, not facts.
5. If any hard constraint exists, evaluate native restrictions separately with [permissions.md](references/permissions.md).
6. Audit the complete rendered draft using the shared audit contract (§5), revise and recheck affected guidance, then present the review (§6).
7. Obtain independent approvals for rule content and for native configuration.
8. Re-read, apply, and validate (§7).

Never commit generated files.

### Protected-path baseline

Snapshot root `CLAUDE.md` and the complete `.claude/` and `.mhk/memory/` trees, including hidden, ignored, and untracked entries. Record each path's existence and type, directory membership, and the contents or a cryptographic digest of every regular file. Record absent roots explicitly, so creating a previously absent tree is detectable. Record symlink targets without following them outside the repository; report any unresolved boundary or unreadable entry. Hashing for preservation does not make every file a source of policy evidence.

Keep this baseline in session state or an ephemeral location outside the target repository, never as a committed bookkeeping file. If a complete baseline cannot be obtained, resolve that validation gap before writing; do not claim the protected paths are unchanged without a baseline. Keep the source/destination record from §2 as well, extending it throughout discovery and drafting.

## 5. Output contract

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

**Root `AGENTS.md`.** This skill owns only the rules block. If `AGENTS.md` has no rules block, add one alongside the existing content — never reinterpret the file as owned.

Include a short repository description, verified common commands with working directories, essential guardrails, and the detailed-rule index. Include exemplars or consequential uncertainty only where useful, preserving in-band human resolutions beside their relevant guidance. Never write memory pointers: the memory block belongs to `$mhk-memory`. An older memory pointer inside the rules block is removed once `AGENTS.md` has a memory block; until then keep it. If there is no memory block, end the report with one line: team memory isn't set up — run `$mhk-memory`. Omit routine evidence labels and empty sections. Treat ~80 lines as a warning; the host's `project_doc_max_bytes` ceiling is a limit to report against, not the content budget.

### Select and check

Use the cartographer's compact report to choose useful overview guidance. Keep the target repository read-only until approval. Reuse its sources; make targeted reads only where a consequential claim is unsupported or unclear. Do not repeat the scan or require a separate evidence/decision table.

Check that named paths, commands, and APIs have support. Preserve command working directories, prerequisites, and meaningful test limitations; distinguish inspection from execution. Keep observed preferences scoped, preserve explicit policy and known exceptions, and describe exemplars by the aspect they illustrate. Ask only for consequential missing information or project intent, respecting settled decisions. Omit weak new claims; account for unresolved existing items rather than silently dropping them.

### Render concise guidance

- Put the repository overview, useful commands, essential cross-cutting rules, and topic routing in the `AGENTS.md` rules block. Omit unnecessary sections.
- Put scoped rules, compact reuse tables, and relevant exemplar pointers/wiring in `.mhk/rules/<topic>.md`, translating applicability into `paths:`. Keep each detail in one home; leave implementation details in source code.
- Prefer a short instruction or purpose plus a source pointer. Retain policy provenance, settled choices, and exceptions that change its meaning. Omit confidence labels, counts, scan history, and routine evidence from coding context.
- Preserve useful existing wording, filenames, ordering, and human content. Explain corrections, consolidations, and proposed removals. Unchanged supported guidance should produce no diff; shortening is not permission to discard confirmed requirements.

For every `.mhk/rules/` document, add a row to the `### Detailed rules and catalogs` table in `AGENTS.md`: the finding's `task` (including creating new files), optional path predicate from `applies_to`, specific coverage from `summary`, and a direct relative link.

For example:

```
| Creating or editing UI/presentation code — screens, widgets, dialogs (`**/presentation/**`) | shared design-system widgets, dialogs, list views, and formatters to reuse | [ui-catalog](.mhk/rules/ui-catalog.md) |
```

Tell Codex to read matching documents during planning and before creating or editing files, without opening every document on every task. These files are not loaded automatically; the index is their retrieval route. A short consequential guardrail can live in the relevant row instead of being repeated above the table. Preserve its scope, and identify any relevant exemplar in the coverage column.

For every hard-constraint finding, retain its instructional rule and pass `operation`, `pattern`, `reason`, and `evidence` to [permissions.md](references/permissions.md). Evaluate native restrictions separately and obtain independent approval for configuration changes. A rule sentence does not establish enforcement; report unsupported, unverified, advisory, and inactive restrictions accurately.

### Review and apply

Read the root and topic documents together before approval, including relevant human guidance. Check working pointers, supported wording, important exceptions, obvious contradictions, and duplicate meaning. Consider ordinary work and new-file creation: can the agent find the necessary guidance without unrelated documents? Keep this a brief review, not a full application audit or mandatory task-size report.

Check the selected instruction files and `AGENTS.md` index within the target repository. Its task rows must support planning/new files and route consumers to relevant `.mhk/rules/` documents without unrelated catalogs. This is model-directed retrieval, not automatic glob loading. Respect instruction conflicts and host limits; report important gaps or unavailable external context without adding another reference directory.

Resolve concrete problems and recheck affected content. Present the complete proposed content or diff for every affected file, including new topics, with a short summary of meaningful changes, retained decisions, and limitations. Obtain the required content and separate native-configuration approvals. After partial approval, ensure accepted links and instructions remain consistent; obtain approval for any revised proposal before writing.

Read back applied files against the approved content. Check markers/frontmatter, links, and platform-specific preservation/configuration requirements. Report mismatches rather than silently changing approved content. Keep working notes temporary, outside the target repository.

**Detailed documents.** `.mhk/rules/<topic>.md`: `paths:` frontmatter first, one topic, evidence where useful, exact trailing `<!-- mhk:generated -->`. `paths:` is mhk metadata; Codex does not load these files by glob. Never write that it does.

**Loading conflicts.** Codex selects at most one instruction file per directory on the path from the repository root to the session's working directory. A selected root `AGENTS.override.md` replaces the root `AGENTS.md`; report that the generated root block will not load in that case. An override in a deeper directory replaces only that directory's `AGENTS.md`: the root file still loads, while deeper guidance can supersede conflicting root instructions. Distinguish a file excluded from loading from a conflict between loaded instructions; never delete overrides. Check the actual load path and selected files, and report when their combined size approaches the host size limit.

**Legacy markers.** The rules block's older markers (see *mhk blocks* above) and the `<!-- mhk:generated - managed by /mhk:rules; edits may be overwritten -->` rules-file trailer still mark mhk-owned content. Whenever you propose changes to such an owned file, include upgrading its markers to `<!-- mhk:rules:begin -->` / `<!-- mhk:rules:end -->` and `<!-- mhk:generated -->` as a separately labelled line in the diff — never rewrite markers silently or without approval. A block must open and close with the same generation of marker; a mixed or unmatched pair is malformed — stop and ask. Claude sources read during migration stay read-only: their legacy markers are recognized, never upgraded by this skill.

**Ownership.** Modify or remove only provably mhk-owned content: the rules block, and `.mhk/rules/` files with the exact marker. An unowned destination file is a conflict — propose a non-colliding destination or ask; never overwrite or delete it. Keep native permission proposals out of instructional files and never equate a rule sentence with enforcement.

**Memory.** `.mhk/memory/` is read-only to this skill. Read committed facts when they explain an exception; never regenerate, reorder, or edit them, and never read native personal memory stores.

## 6. Review

Before writing anything, present:

1. the verification (migration summary) or scan summary, plus the shared audit summary: meaningful changes, retained policies, important retrieval gaps, and remaining limitations;
2. every add / change / remove, and every unresolved finding with its question;
3. the complete proposed content or diff for **every** affected file — including new, untracked files;
4. native permission changes as a separately labeled diff, with each restriction's status: enforced (validated), advisory, unsupported, unverified, or inactive due to configuration precedence.

Allow approval or rejection of individual rules, files, and permission changes. After a partial approval, apply only an internally consistent subset: every accepted index row must point to a document that will exist, and a rejected document must not leave a dangling index row or root reference. Resolve dependent approvals before writing; if an approval would leave an inconsistency, say so and ask.

## 7. Apply and validate

Immediately before writing, re-read every source and destination in the record started in §2 and extended during verification and drafting, checking both contents and existence, including sources read during the audit. Re-snapshot the protected paths and compare their complete path sets, types, symlink targets, and file contents/digests with the protected-path baseline. If anything changed during review, recompute the affected proposal and show it again instead of applying a stale diff; refresh the baseline only after accounting for those changes. Preserve human content and existing verified ordering.

After writing, read back the outputs against the approved content; report mismatches without silently rewriting the proposal. Validate:

- rules-block markers are single and well-formed, and the memory block in `AGENTS.md`, if any, is unchanged; `.mhk/rules/` frontmatter parses and each owned file ends with the exact marker;
- every index link resolves; no two index rows target the same document for unrelated topics; no duplicate destinations;
- `paths:` globs match intended files;
- TOML parses, if `.codex/config.toml` changed;
- `CLAUDE.md`, `.claude/`, and `.mhk/memory/` are **byte-for-byte unchanged** versus the protected-path baseline: compare the complete path sets, entry types, symlink targets, and contents/digests, detecting additions and deletions as well as edits. Include roots recorded as absent. Do not rely on `git diff`, which omits untracked files. Report any mismatch or unreadable entry as a failed or incomplete validation; never claim preservation succeeded or overwrite a concurrent change to make the comparison pass.

State plainly in the final report that the index is **model-directed retrieval**, not automatic path-triggered loading, and that native configuration may need a trusted project and a new session to take effect.

## 8. Reruns

Re-verify existing Codex items and look for relevant new discoveries with the [repo-cartographer.md](references/repo-cartographer.md) method, passing it the existing items so its report accounts for each source item and its disposition. Compare current evidence with every owned item — root-block lines, index rows, `.mhk/rules/` files, catalog rows, exemplars: correct stale locations and commands with targeted reads, without a prevalence census. Preserve verified wording, filenames, ordering, and human resolutions by default, including in-band `divergence resolved` comments unless the clusters have materially changed. The shared audit may propose a justified correction or consolidation with each original item accounted for, the reason, and the destination of retained meaning. Unchanged evidence and no concrete audit defect mean no diff. Remove obsolete or redundant owned content only with evidence/reason and approval. Do not keep a bookkeeping file or manifest; the owned files and in-band markers are the whole state.
