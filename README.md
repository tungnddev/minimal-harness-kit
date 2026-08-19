# Minimal Harness Kit (`mhk`)

Lean tooling for AI-assisted coding. `mhk` onboards a fresh, non-AI-native repo — a single service, app, or library — onto Claude Code and keeps it tuned over time, with **no generic-rule bloat** and **no state file to maintain**. Everything it produces is a plain committed file you can read and edit; ownership is marked *in-band*, so there is no hidden cache or manifest to drift.

- **Brand / npm package / marketplace:** `minimal-harness-kit`
- **Alias — plugin id + CLI bin:** `mhk`
- **Commands:** `/mhk:rules` · `/mhk:rules-add` · `/mhk:memory` · `/mhk:doctor`

## Two layers: rules and memory

A repo that's genuinely tuned for an AI agent has two kinds of knowledge, and they come from two different places — so `mhk` keeps them as two independent layers, each owned by its own command.

### Rules — the *derived* layer (from a code scan)

Everything a read-only scan of the code can infer: what the repo is, its real commands, its project-specific conventions, the shared surfaces worth reusing, the archetypes worth mirroring, and the files that must never be edited.

- **`/mhk:rules`** — scans the repo and converges the derived layer: the `CLAUDE.md` managed block, scoped `.claude/rules/*.md` files (cross-cutting conventions + reuse-surface catalogs), one-line **exemplar** pointers, and `permissions.deny` hard constraints. It's **idempotent** — run it on a fresh repo and it proposes everything; run it again after the code moves and it proposes *only what drifted*. No separate "init"; the first run *is* onboarding.
- **`/mhk:rules-add "rule text"`** — the manual fast path: record a gotcha you already know straight into the rules layer, skipping the scan.

### Memory — the *accumulated* layer (from native auto-memory)

The knowledge a scan **can't** show: invariants, war-stories, business rules — the *why*. Claude accumulates this in its local per-project auto-memory as you work, but that store is machine-local, so a fresh checkout doesn't inherit it.

- **`/mhk:memory`** — promotes the durable, repo-general, non-sensitive slice of *this machine's* native auto-memory into a committed store at `.mhk/memory/`, so a fresh checkout starts as tuned as this machine is. It is **read-only on native memory**, scrubs anything personal or secret, and is approval-gated. The committed files are **faithful mirrors** of Claude's native memory format, so if that format ever changes, the next run surfaces it as a diff.

### And a way to check

- **`/mhk:doctor`** — a read-only overview of both layers: what exists, what looks stale or missing, and which command to run next. It writes nothing.

Every command runs **only when you type it**, proposes a diff, and waits for your approval before writing. Nothing is ever auto-triggered mid-task.

## How it's shipped

`mhk` is a **globally-installed Claude Code plugin**, not files copied into your repo. Plugin assets live in `~/.claude/plugins/cache/…` and are referenced via `${CLAUDE_PLUGIN_ROOT}`. The only things that land in a target repo are the **generated output you commit**: `CLAUDE.md`, `.claude/rules/*.md`, `permissions.deny` (in `.claude/settings.json`), and — once you promote any memory — `.mhk/memory/*`. There is **no `mhk` state/cache file**; the files above are the whole state. Plugin auto-update propagates improvements to every repo at once.

This kit always operates on exactly one repo — no monorepo fan-out and no spanning multiple git repositories. Run the commands inside each repo separately.

## Repository layout (monorepo)

```
minimal-harness-kit/
├── .claude-plugin/marketplace.json   # marketplace catalog → ./plugins/claude
├── plugins/claude/                   # the Claude Code plugin (self-contained)
│   ├── .claude-plugin/plugin.json    # name "mhk" — drives the /mhk: namespace
│   ├── commands/   rules.md · rules-add.md · memory.md · doctor.md
│   ├── agents/     repo-cartographer.md   # read-only scanner (Read/Grep/Glob)
│   ├── playbooks/  backend · frontend · mobile
│   └── templates/  CLAUDE_TEMPLATE · RULES_TEMPLATE · MEMORY_TEMPLATE
└── cli/                              # the `mhk` CLI (placeholder for now)
```

This repo is the plugin **source**, not a consumer — so the commands/agent aren't loaded when you work here; install the plugin (below) to use them.

## Install

**A. Per user (interactive):**

```sh
claude plugin marketplace add <your-org>/minimal-harness-kit
claude plugin install mhk@minimal-harness-kit
/reload-plugins
```

**B. Per repo (committed, auto-updating for the whole team)** — add to the target repo's `.claude/settings.json`. This commits only a small pointer (no plugin resources land in the repo):

```json
{
  "extraKnownMarketplaces": {
    "minimal-harness-kit": {
      "source": { "source": "github", "repo": "<your-org>/minimal-harness-kit" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": ["mhk@minimal-harness-kit"]
}
```

> Third-party marketplaces have auto-update **off** by default; `"autoUpdate": true` above (or the `/plugin` → Marketplaces toggle) turns it on so updates land automatically, followed by a `/reload-plugins` prompt.

## Usage

1. `/mhk:rules` — scan the repo; review the proposed `CLAUDE.md` diff (plus any `.claude/rules/*.md` and `permissions.deny` proposals); approve/edit/reject per file or per rule. Nothing is written without approval.
2. Work normally — Claude Code loads the repo's `CLAUDE.md` automatically.
3. `/mhk:rules` again — periodically, or after a significant refactor; it diffs only what changed since last time.
4. `/mhk:rules-add "rule text"` — record a human-known gotcha directly, skipping detection.
5. `/mhk:memory` — promote the durable *why* from this machine's native auto-memory into `.mhk/memory/`, so teammates and fresh checkouts inherit it.
6. `/mhk:doctor` — anytime, to see what exists and what to run next.

## CLI (placeholder)

The `mhk` CLI is scaffolded but does nothing yet:

```sh
npm i -g minimal-harness-kit   # installs the `mhk` binary
mhk                            # prints a placeholder banner
```

Planned: multi-repo `mhk add-dir`, global `CLAUDE.md` pull/sync, and rendering for non-plugin agents.

## Design principles (why it's built this way)

- **Two layers, two owners.** `/mhk:rules` owns everything derivable from a scan; `/mhk:memory` owns the promoted *why*. They never touch each other's files — the only handoff is a single static pointer to `.mhk/memory/MEMORY.md` that `/mhk:rules` writes into `CLAUDE.md`.
- **Idempotent converge, not create-vs-update.** `/mhk:rules` proposes everything on a fresh repo and only the drift on a tuned one — there's nothing to initialize and no version to track.
- **In-band ownership, no state file.** mhk manages only what it can prove it created: the `<!-- BEGIN/END: ai-guide -->` block in `CLAUDE.md`, and rules files carrying an `<!-- mhk:generated -->` marker. Anything you hand-wrote is preserved untouched, and `permissions.deny` entries are only ever appended. Ownership travels *with* the file, so nothing can fall out of sync the way a side manifest would.
- **Delta-only rules.** A rule is written only if it contradicts an ecosystem default, is a real (>70%-consistent) but non-obvious convention, or is a cross-cutting gotcha. Generic language/framework best practice is never written down.
- **Explicit invocation only.** Every command runs when typed — never model-auto-triggered — the biggest lever against hallucinated mid-task regenerations.
- **Approval-gated writes.** Every command proposes a diff and waits for a yes. `permissions.deny` changes are called out separately since they alter enforced behavior.
- **Hard token budget.** ~80 lines for the repo's `CLAUDE.md`; scoped rule bodies and memory bodies load on demand, not every session.
- **Least privilege.** `repo-cartographer` has only Read/Grep/Glob — a scan can never have write-level side effects. `/mhk:memory` is read-only on native memory and scrubs anything sensitive before it can reach a committed path.
- **Capture the reuse surface, not just constraints.** A repo's shared widgets/hooks/helpers/base classes are captured as a compact `name | purpose | where` lookup (never code skeletons), so the LLM reuses them instead of reinventing them.
- **Signpost every scoped rule in `CLAUDE.md`.** A path-scoped `.claude/rules/` file loads only when a matching file is read — absent during planning and file creation — so each scoped file also gets a one-line pointer in the always-loaded `CLAUDE.md`.
- **Exemplars point, never paste.** For a repeated multi-file archetype, record a one-line `mirror <canonical path>` pointer plus the single non-visible wiring step — the copyable shape stays in live code and can't drift. When several competing shapes exist for one archetype, the tool surfaces the divergence and asks which is canonical rather than guessing — never by a version-name suffix.
- **Mirror native memory faithfully.** Promoted memory files copy Claude's native auto-memory format byte-for-shape, with no mhk-specific fields, so a future change to that format shows up as a diff instead of being silently absorbed.

## Roadmap

- **Phase 1 (now):** the Claude plugin (working, installable) + a placeholder CLI.
- **Phase 2:** extract a shared, tool-neutral `core/` (methodology, playbooks, templates) with a build step that vendors it into each plugin; add a **Codex** variant wrapping the same methodology (as Codex **skills** — Codex has deprecated custom prompts).
- **Phase 3:** real CLI — multi-repo launcher, global `CLAUDE.md` sync, and an `AGENTS.md` renderer covering non-plugin agents (Cursor, Gemini CLI, Copilot, Aider, Windsurf, Zed).
