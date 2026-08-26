# Design principles

Why `mhk` is built the way it is. The [README](../README.md) covers *what* it does; this covers *why* every choice was made.

## Two layers, two owners

`mhk` splits repo knowledge into two independent layers, each owned by exactly one command.

- **Rules — the *derived* layer.** Everything a read-only scan of the code can infer: what the repo is, its real commands, its project-specific conventions, the shared surfaces worth reusing, the archetypes worth mirroring, and the files that must never be edited. Owned by **`/mhk:rules`**.
- **Memory — the *accumulated* layer.** The knowledge a scan **can't** show: invariants, war-stories, business rules — the *why*. Claude accumulates this in its local per-project auto-memory as you work, but that store is machine-local, so a fresh checkout doesn't inherit it. Owned by **`/mhk:memory`**.

The two layers never touch each other's files. The only handoff is a single static pointer to `.mhk/memory/MEMORY.md` that `/mhk:rules` writes into `CLAUDE.md`.

## The principles

- **Idempotent converge, not create-vs-update.** `/mhk:rules` proposes everything on a fresh repo and only the drift on a tuned one — there's nothing to initialize and no version to track. The first run *is* onboarding.

- **In-band ownership, no state file.** mhk manages only what it can prove it created: the `<!-- BEGIN/END: ai-guide -->` block in `CLAUDE.md`, and rules files carrying an `<!-- mhk:generated -->` marker. Anything you hand-wrote is preserved untouched, and `permissions.deny` entries are only ever appended. Ownership travels *with* the file, so nothing can fall out of sync the way a side manifest would.

- **Delta-only rules.** A rule is written only if it contradicts an ecosystem default, is a real (>70%-consistent) but non-obvious convention, or is a cross-cutting gotcha. Generic language/framework best practice is never written down.

- **Explicit invocation only.** Every command runs when typed — never model-auto-triggered. This is the biggest lever against hallucinated mid-task regenerations.

- **Approval-gated writes.** Every command proposes a diff and waits for a yes. `permissions.deny` changes are called out separately since they alter enforced behavior.

- **Hard token budget.** ~80 lines for the repo's `CLAUDE.md`; scoped rule bodies and memory bodies load on demand, not every session.

- **Least privilege.** `repo-cartographer` has only Read/Grep/Glob — a scan can never have write-level side effects. `/mhk:memory` is read-only on native memory and scrubs anything sensitive before it can reach a committed path.

- **Capture the reuse surface, not just constraints.** A repo's shared widgets/hooks/helpers/base classes are captured as a compact `name | purpose | where` lookup (never code skeletons), so the LLM reuses them instead of reinventing them.

- **Signpost every scoped rule in `CLAUDE.md`.** A path-scoped `.claude/rules/` file loads only when a matching file is read — absent during planning and file creation — so each scoped file also gets a one-line pointer in the always-loaded `CLAUDE.md`.

- **Exemplars point, never paste.** For a repeated multi-file archetype, record a one-line `mirror <canonical path>` pointer plus the single non-visible wiring step — the copyable shape stays in live code and can't drift. When several competing shapes exist for one archetype, the tool surfaces the divergence and asks which is canonical rather than guessing — never by a version-name suffix.

- **Mirror native memory faithfully.** Promoted memory files copy Claude's native auto-memory format byte-for-shape, with no mhk-specific fields, so a future change to that format shows up as a diff instead of being silently absorbed.
