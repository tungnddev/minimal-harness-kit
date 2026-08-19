---
description: Promote durable facts from this machine's native Claude auto-memory into the repo's committed .mhk/memory store — the repo-general, non-sensitive, non-derivable slice — so a fresh checkout starts as tuned as this machine. Read-only on native memory; approval-gated.
argument-hint: "[path]"
---

Promote the durable, repo-general slice of *this machine's* accumulated Claude auto-memory into the committed repo, so a fresh checkout starts as tuned as this machine is. This closes the *accumulated* half of "fresh = tuned"; the *derived* half (rules, catalogs, exemplars, deny) is `/mhk:rules`.

This command is **human-invoked only** and **read-only on native memory**: it reads Claude's per-project auto-memory store to compare, but never writes, edits, or deletes anything there. The only writes it proposes are to the repo, and every one is shown as a diff and waits for explicit approval before landing.

Operate on `${ARGUMENTS:-the current repository}` — one repo, one committed memory store at `.mhk/memory/`.

## Inputs

1. **Native store (read-only) — the inbox:** this machine's Claude auto-memory files for this project — the frontmatter (`name`/`description`/`metadata`) fact files plus the native `MEMORY.md` index. Local, unreviewed arrivals.
2. **Committed store — you own all of `.mhk/memory/`:** the `.mhk/memory/<slug>.md` fact files *and* `.mhk/memory/MEMORY.md` (the committed mirror of native `MEMORY.md`). Both are **faithful mirrors of the native format** (see `${CLAUDE_PLUGIN_ROOT}/templates/MEMORY_TEMPLATE.md`) — no mhk-specific fields inside them, so they stay byte-comparable to their native origin. **There is no side bookkeeping file: the store IS the state.** A file's presence under `.mhk/memory/` means it was promoted; a fact elevated to the opt-in scoped-rule tier lives in `.claude/rules/*` instead. The tier is recorded by *where the fact lives*, nothing else.
3. **Existing derived guidance:** the current CLAUDE.md managed block and `.claude/rules/*.md`, so a fact already covered there isn't promoted twice. CLAUDE.md carries only a **static pointer** to `.mhk/memory/MEMORY.md` (written by `/mhk:rules`) — this command never edits CLAUDE.md; it writes the store.

Compute the full state each run — this command is **idempotent**. A fact already promoted and unchanged produces no diff; re-running after a missed capture simply picks the fact up. Nothing is ever lost by not running it at exactly the right moment.

## Pipeline

For each native fact, in this order:

1. **Sensitive scrub.** Drop or redact anything personal or secret: email addresses, credentials/tokens/secrets, internal hostnames/IPs, machine-local absolute paths, and opinions about named people. When in doubt, exclude and say why — the terminal invariant is that nothing sensitive ever reaches a committed path. This is non-negotiable; the final human review is a backstop, not the primary filter.
2. **Necessity / dedup.** Drop anything already covered by the CLAUDE.md managed block or an existing `.claude/rules/*.md` file — a promoted copy would just be duplicate tokens that drift.
3. **Portability filter.** Keep only facts that are **repo-general × verified × non-derivable × durable**. Personal-to-this-developer facts (`type: user`, most `type: feedback`) stay local. "Non-derivable" means a code scan can't reproduce it — invariants, war-stories, business rules, the *why* — which is exactly the class `/mhk:rules` cannot generate. Re-check "verified" against the live code at run time: if a promoted fact's native origin is gone *and* its evidence no longer holds in the code, propose removal.
4. **Conflict + merge.** If a surviving fact already exists in the committed store, reconcile: a newer native version supersedes; a teammate-committed entry that conflicts is flagged for the user to merge, not silently overwritten.
5. **Format-drift check.** Compare each native fact file against its committed mirror **as files** — shape as well as content. Because the mirror is a byte-faithful copy of the native shape, a change in the native format (a new frontmatter key, a different `metadata` shape, a changed `MEMORY.md` index convention) shows up directly in this diff. Surface any such *shape* change **separately and prominently**: it may mean Claude Code changed its native memory format, and the mirror + `MEMORY_TEMPLATE.md` should be updated to match. This is the payoff of mirroring the native format instead of inventing our own.

## Proposal

For each surviving fact, propose:

- **Action:** add / update / remove (remove when a promoted fact's native origin is gone *and* its evidence no longer holds).
- **Tier:**
  - **pull-index (default)** — write `.mhk/memory/<slug>.md` as a faithful native-format mirror, and add/update its one-line pointer in `.mhk/memory/MEMORY.md` in the native `MEMORY.md` style (`- [Title](<slug>.md) — <relevance hook>`, link relative to `.mhk/memory/`). The hook must read as a trigger ("when X …"), because committed files are pulled on demand, not recalled. **Do not touch CLAUDE.md** — its static pointer to `MEMORY.md` already covers every promoted fact.
  - **scoped rule (opt-in only)** — for a must-not-miss guardrail the user explicitly elevates, write it as a `.claude/rules/<topic>.md` with `paths:` (and the `<!-- mhk:generated -->` trailer) instead, so it auto-loads on file-touch. Never auto-pick this tier; offer it.
- **Rationale:** one line — why it passed the filters and why this tier.

## Write

Present the complete proposed diff — new/changed `.mhk/memory/<slug>.md` files, the `.mhk/memory/MEMORY.md` pointer lines, and any opt-in `.claude/rules/*.md` — clearly separated and labeled. If `.mhk/memory/MEMORY.md` does not exist yet, this run creates it with a native-`MEMORY.md`-style header. **Do not write anything yet.** Wait for the user to approve, edit, or reject individual facts. On approval, write only what was approved. Leave the actual `git commit` to the user — crossing into git history is theirs to make deliberately.

Never invoke this command automatically, and never touch native auto-memory.
