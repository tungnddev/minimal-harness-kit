---
description: Set up and maintain this repo's shared team memory — the CLAUDE.md memory block and the committed .mhk/memory store — and share durable, repo-general facts from this machine's native Claude auto-memory. Read-only on native memory; approval-gated.
argument-hint: "[path]"
disable-model-invocation: true
---

<!-- Generated from adapters/claude/package/commands/memory.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

`/mhk:memory` owns the **memory layer**: the memory block in `CLAUDE.md` and everything under `.mhk/memory/`. The layer holds what a code scan can't show — invariants, business rules, past incidents, the *why* — and shares it with every checkout. It works with or without the rules layer (`/mhk:rules`).

The first run on a repository sets the layer up, even with nothing to share yet; later runs keep it current. The command is **idempotent**: an unchanged, current layer produces no diff, and nothing is lost by not running it at a particular moment.

Facts reach the store two ways:

- **The capture offer** in the memory block: when Claude saves a project memory the whole team would need, it asks at the end of the task whether to share it, and copies it on a yes.
- **This command's sweep**, which picks up anything the offer missed.

This command is **human-invoked only** and **read-only on native memory**: it reads Claude's per-project auto-memory store to compare, but never writes, edits, or deletes anything there. Every write it proposes is shown as a diff and waits for explicit approval.

Operate on the repository path in `$ARGUMENTS`, or the current repository when none is given: one repo, one store at `.mhk/memory/`.

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

## Inputs

1. **Native store (read-only):** this machine's Claude auto-memory files for this project, plus its native `MEMORY.md` index.
2. **Committed store:** the fact files and index under `.mhk/memory/`, in the format of `${CLAUDE_PLUGIN_ROOT}/templates/MEMORY_TEMPLATE.md`.
3. **`CLAUDE.md`:** the memory block, whose exact content is `${CLAUDE_PLUGIN_ROOT}/templates/MEMORY_BLOCK.md`; and, as context only, the rules block and `.claude/rules/*.md`, so nothing already covered there is shared twice.

## Set up the layer

Converge the memory block to the template's exact content. If `.mhk/memory/MEMORY.md` does not exist, create it with the index header, so the block's import resolves from the next session on. If the rules block still contains an older memory pointer (a Project memory subsection, or a line pointing at `.mhk/memory/MEMORY.md`), leave it: it belongs to the rules block, and the next `/mhk:rules` run removes it. Say so in the report.

## Sweep native memory

For each native fact, in this order:

1. **Sensitive scrub.** Drop or redact anything personal or secret: email addresses, credentials/tokens/secrets, internal hostnames/IPs, machine-local absolute paths, and opinions about named people. When in doubt, exclude and say why — the terminal invariant is that nothing sensitive ever reaches a committed path. This is non-negotiable; the final human review is a backstop, not the primary filter.
2. **Necessity / dedup.** Drop anything already covered by the rules block or an existing `.claude/rules/*.md` file, or already stated by a different committed fact — a second copy would just be duplicate tokens that drift.
3. **Portability filter.** Keep only facts that are **repo-general × verified × non-derivable × durable**. Personal-to-this-developer facts (`type: user`, most `type: feedback`) stay local. "Non-derivable" means a code scan can't reproduce it — invariants, war-stories, business rules, the *why* — which is exactly the class `/mhk:rules` cannot generate.
4. **Conflict + merge.** If a surviving fact already exists in the committed store, reconcile: a newer native version supersedes (judge "newer" by `metadata.modified` when both copies carry it); a teammate-committed entry that conflicts is flagged for the user to merge, not silently overwritten.
5. **Shape and change check.** Compare each native fact with its committed copy in two separate ways — never byte-for-byte:
   - **Shape** — the set of frontmatter key paths, plus the native `MEMORY.md` line style (`- [Title](file.md) — hook`). A key or convention that appears, disappears, or moves on the native side may mean Claude Code changed its memory format. Surface it **separately and prominently** so `MEMORY_TEMPLATE.md` can be updated to match. This is the payoff of keeping the native shape instead of inventing our own.
   - **Change** — every value except the **volatile keys** listed in `MEMORY_TEMPLATE.md` (per-machine or per-write stamps, currently `metadata.originSessionId` and `metadata.modified`) and except YAML formatting such as quoting or trailing spaces. Copy volatile values along whenever a fact is added or its content changes, but a difference only in volatile values or formatting is not a change and produces no proposal. If a newly appearing key looks like such a stamp, treat it as volatile for this run and report it so the template's list can be updated.

A fact the capture offer already shared is identical to its native copy apart from volatile keys, so the sweep leaves it alone.

## Check committed facts

Check every committed fact by the store's rules, whether or not this machine has a native copy of it. If a fact reads like an always-apply instruction rather than context, say so and offer its text for `/mhk:rules-add`; never write rules files yourself.

## Proposal and write

For each change, show the **action** (add / update / remove) and a one-line **rationale**. Present the complete proposed diff — the memory block, new or changed fact files, and the regenerated index — clearly separated and labeled. Always regenerate the whole index from the fact files; this also repairs a hand-edited index or leftover merge-conflict markers, so an index conflict after a merge is resolved by re-running this command.

**Do not write anything yet.** Wait for the user to approve, edit, or reject individual changes. On approval, write only what was approved, then read it back against the approved content and check that the memory block's markers are single and well-formed and every index link resolves. Leave the actual `git commit` to the user — crossing into git history is theirs to make deliberately.

Never invoke this command automatically, and never touch native auto-memory.
