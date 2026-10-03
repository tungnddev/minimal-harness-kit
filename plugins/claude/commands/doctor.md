---
description: Fast, read-only health check of this repo's mhk rules and team memory — what is set up, what is broken or stale, and which command fixes it. Writes nothing.
argument-hint: "[path]"
disable-model-invocation: true
disallowed-tools: Write, Edit, NotebookEdit
---

<!-- Generated from adapters/claude/package/commands/doctor.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

`/mhk:doctor` gives a fast, **read-only** overview of the mhk layers in one repository: the path in `$ARGUMENTS`, or the current repository when none is given. It diagnoses and routes; every fix belongs to another command that the user runs deliberately. Never invoke `repo-cartographer`: the deep scan belongs to `/mhk:rules`.

## Ground rules

- **Read-only.** Create, edit, move, delete, format, or stage nothing, in the repository or anywhere else. Run no build, test, install, or code-generation command and no discovery scan. Use `git` only for read-only queries such as `git ls-files`, `git status --porcelain`, `git check-ignore`, `git log`, and `git rev-list --count`.
- **Fast.** Batch the work: list the mhk files and search them for markers in a few calls; read `CLAUDE.md`, the owned topics, and `.mhk/memory/MEMORY.md` once each; read only the frontmatter of fact files, plus one pattern search over their bodies. Check every pointer by existence (a listing or glob), never by opening its target.
- **Surface health, not verification.** Doctor checks that mhk's files are well-formed and consistent, are shared through Git, and still name paths, globs, and scripts that exist. It never judges whether a rule or fact is still *true*: `/mhk:rules` and `/mhk:memory` reruns re-verify content against the code. A clean report is not verification.
- **Owned content only.** Text outside mhk blocks and unmarked files in `.claude/rules/` are human-authored: count them, never flag them.

## Report

Print only the report, in this shape (illustrative values):

```markdown
**mhk doctor** · `services/api` · CLAUDE.md

**Rules** · `/mhk:rules`
- ✓ rules block — 14 instructions · 4 topics · 3 exemplars
- ✗ `.claude/rules/payments.md` is routed from CLAUDE.md but missing
- ! `.claude/rules/api.md` — `paths:` glob `src/api/**` matches no files

**Memory** · `/mhk:memory`
- ✓ memory block current · 12 facts (9 project, 3 reference) · index in sync

**Sharing**
- ! 2 mhk files untracked, so teammates won't receive them: `.mhk/memory/refund-destination.md`, `.claude/rules/api.md` → commit them
- · rules last changed 3 months ago, 212 commits since

**1 error · 2 warnings** → run `/mhk:rules`, then commit the untracked files
```

- Marks: `✓` healthy · `!` warning: works today but is drifting or at risk · `✗` error: guidance will not load, points at nothing, or blocks the next workflow · `·` information: a neutral fact, an upgradable legacy marker, or an optional layer that is not set up. A layer that is not set up is never a warning or an error.
- Sections in this order: Rules, Memory, Sharing, then the other platform when present. A healthy section is a single `✓` line with its overview counts; otherwise give the overview line, then one line per finding.
- On a `!` or `✗` line whose fix is not the section's command (a commit, a human merge), name the fix after `→`. Collapse repeated findings of one kind into one line with up to three examples and "and N more".
- End with one line: the error and warning counts, then the commands to run in order, errors first. With no `!` or `✗`, end with **Everything looks current.**, plus any optional next step suggested by a `·` line.
- Report counts, paths, and slugs only: never fact bodies and never matched sensitive text. Propose no diffs or rewritten content, and do not offer to run a fix; the user runs the next command deliberately.

## Checks

### `CLAUDE.md`
- Missing: neither layer is set up.
- Each mhk block appears at most once, opens and closes with markers of the same generation, and keeps the order rules, then memory. A duplicate, mixed, or unmatched pair is `✗`: every writing workflow stops on it until it is fixed by hand.
- Older rules-block markers → `·` upgradable; the next `/mhk:rules` run proposes the upgrade.
- Content but no mhk blocks → `·` human guidance only; `/mhk:rules` adds its block alongside it.

### Rules layer
- **Block.** Present? Count its instructions, routed topics, and exemplar pointers. Absent → `·` not set up.
- **Topics.** Split `.claude/rules/*.md` into owned (ending with the exact `<!-- mhk:generated -->`) and hand-written. A file ending with the legacy `<!-- mhk:generated - managed by /mhk:rules; edits may be overwritten -->` is owned → `·` upgradable.
- **Routing.** Every owned topic must be reachable from the rules block, and every routed topic must exist; see the platform section.
- **Scope.** Each owned topic starts with `paths:` frontmatter; missing or malformed → `!`. Each glob should match at least one tracked file (`git ls-files -- '<glob>'`, or a glob search outside Git); a glob that matches nothing → `!` stale scope.
- **Pointers.** Repository paths named in the rules block and owned topics (inline-code paths, `mirror <path>` exemplars, relative links) must exist. Skip placeholders, illustrative examples, URLs, package imports, and globs. Missing → `!` stale pointer.
- **Commands.** A listed command that runs a named script or target (`npm run <x>`, `pnpm <x>`, `yarn <x>`, `make <x>`, `just <x>`) must be defined in the manifest at its stated working directory. Undefined → `!`. Never run the command.

### Memory layer
- **Block.** Absent → `·` not set up. Present but not identical to this platform's exact memory block (see the platform section) → `!` outdated.
- **Old pointer.** A memory pointer still inside the rules block (a Project memory subsection, or a line pointing at `.mhk/memory/MEMORY.md`) → `·`: once the memory block exists, the next `/mhk:rules` run removes it.
- **Index.** `.mhk/memory/MEMORY.md` missing while the memory block exists → `✗`: the block points at nothing. Otherwise derive the expected index from the fact files exactly as the store format below specifies, and compare. Merge-conflict markers → `✗`; any other difference (a missing, extra, or misordered line, or edited text) → `!`. `/mhk:memory` regenerates it either way.
- **Facts.** Each fact's `name` matches its filename, `description` is present, and `metadata.type` is `project` or `reference`; otherwise `!`. Merge-conflict markers in a fact → `✗`, needing a human merge.
- **Committed safety.** An email address, a machine-local absolute path (`/Users/`, `/home/`, a drive letter), an IP address, or a token-like secret in a fact → `✗`; name the file and the kind only. `/mhk:memory` scrubs it.
- **Stale references.** A repository path named in a fact that no longer exists → `!` for review with `/mhk:memory`.

### Sharing
- Outside a Git repository, say so in one `·` line and skip this section.
- `CLAUDE.md`, owned topics, or `.mhk/memory/` files that are untracked or ignored → `!` teammates won't receive them; the fix is committing them or dropping the ignore rule. Tracked files with uncommitted changes → `·`.
- **Freshness.** One `·` line: when `CLAUDE.md` and the owned topics last changed (`git log -1`) and how many commits have landed since. This is context, not a defect; a long gap is a reason to run `/mhk:rules`, which re-verifies.

## Ownership contract

The writing workflows follow this contract. Check the repository against it; doctor itself writes nothing.

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

## The store: `.mhk/memory/`

Committed facts about this repository that a code scan cannot show: invariants, business rules, past incidents, and the reasons behind decisions. One fact per file, plus an index derived from the files.

### Fact file: `.mhk/memory/<slug>.md`

```
---
name: <slug, kebab-case, matching the filename>
description: <one line: what the fact is and when it matters>
metadata:
  node_type: memory
  type: project | reference
---

<the fact, followed by **Why:** and **How to apply:** lines. Link related facts with [[their-slug]].>
```

- `project` covers decisions, invariants, business rules, and incidents; `reference` says where information lives outside the repository.
- Never store secrets, credentials, email addresses, internal hostnames or IPs, machine-local absolute paths, customer data, or opinions about people.
- A fact copied from a native memory store may carry extra `metadata` keys; keep them unchanged. Never add mhk-specific fields.

### Index: `.mhk/memory/MEMORY.md`

The index is derived from the fact files. Regenerate it instead of editing it:

```
# Team memory

Facts about this repository, one file each beside this index. Read the ones relevant to the task.

- [Driver wallet cancel](driver-wallet-cancel.md) — Driver-cancelled trips refund to the in-app wallet, never the card; check before changing cancellation or refund flows
```

- The three header lines are fixed. Then one line per fact file, sorted by filename.
- `[Title]` is the fact's `name` with hyphens and underscores read as spaces and the first letter capitalized; the link is the filename; the text after the dash is the fact's `description`, unchanged.
- Nothing else goes in the file. A hand edit or a merge conflict is repaired by regenerating it.
- With no facts, the index is only the header.

### Who writes here

- **The capture offer** in the memory block: during normal work, the agent may add or correct one fact and its index line, only after the user approves the exact text. It never deletes facts and never commits.
- **`/mhk:memory`**: sets up the memory block and the index, checks existing facts, and proposes additions, corrections, merges, and removals for approval. It never commits.
- Nothing else writes here.

### Checking existing facts

Propose removing or correcting a fact only on evidence: a path, symbol, or command it depends on is gone from the code; a newer fact contradicts or retracts it; or it repeats guidance that already lives in the rules layer. A fact with no native copy on this machine is normal, so that is never a reason to remove it, and the code cannot confirm a non-derivable fact by definition.

## Claude Code specifics

- **Routing.** Claude loads a `.claude/rules/` topic only when a file matching its `paths:` is read, so each owned topic also needs a one-line signpost in the rules block naming its path. A signpost whose file is missing → `✗`. An owned topic with no signpost → `!`: it is invisible during planning and new-file creation.
- **Scope.** A `paths:` glob that matches nothing means the topic never loads. A topic without `paths:` loads in every session; count it toward context size.
- **Context size.** `CLAUDE.md`, the memory index it imports, and unscoped topics load in every session. Approaching ~200 lines combined → `!`.
- **Hard constraints.** If `.claude/settings.json` exists, it must parse as JSON; otherwise `✗` (Claude Code's own `/doctor` shows the parse error). Report how many `permissions.deny` entries it has; none is fine.
- **Memory block.** Compare with the exact block, begin marker to end marker, in `${CLAUDE_PLUGIN_ROOT}/templates/MEMORY_BLOCK.md`.
- **Unshared native facts.** Find this machine's Claude auto-memory directory for the target repository and read only the frontmatter of its facts, never their bodies. Count facts whose `metadata.type` is `project` or `reference` and that have no file of the same name in `.mhk/memory/`, and report them as one `·` line with their slugs → `/mhk:memory` to review them. Many rightly stay personal, so this is never a warning. If the store can't be found, report `· native memory not checked`. Never write there.
- **Codex side.** Detect it without checking it: if root `AGENTS.md` has an mhk rules block or `.mhk/rules/` exists, add a **Codex** section with one `·` line: Codex rules present; check them with `$mhk-doctor` in Codex. If Codex has mhk rules and `CLAUDE.md` has no rules block, add that `/mhk:rules migrate` imports and verifies them. The memory store is shared, so the Memory section already covers both platforms.
