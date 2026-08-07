# Minimal Harness Kit (`mhk`)

Lean tooling for AI-assisted coding. The first tool onboards a fresh, non-AI-native repo — a single service, app, or library — onto Claude Code, generating a project-specific `CLAUDE.md`, scoped `.claude/rules/*`, and `permissions.deny` hard constraints, with **no generic-rule bloat** and no skill-count hallucination risk. More tools (a multi-repo launcher, global `CLAUDE.md` sync, and support for other agents such as Codex) are planned.

- **Brand / npm package / marketplace:** `minimal-harness-kit`
- **Alias — plugin id + CLI bin:** `mhk`
- **Commands:** `/mhk:init` · `/mhk:sync` · `/mhk:add`

## How it's shipped

`mhk` is a **globally-installed Claude Code plugin**, not files copied into your repo. Plugin assets live in `~/.claude/plugins/cache/…` and are referenced via `${CLAUDE_PLUGIN_ROOT}`. The only things that land in a target repo are the **generated output you commit**: `CLAUDE.md`, `.claude/rules/*.md`, `permissions.deny`, and one small state cache `.mhk/repo-map.yaml`. Nothing to gitignore; plugin auto-update propagates improvements to every repo at once.

This kit always operates on exactly one repo — no monorepo fan-out and no spanning multiple git repositories. Run `/mhk:init` inside each repo separately.

## Repository layout (monorepo)

```
minimal-harness-kit/
├── .claude-plugin/marketplace.json   # marketplace catalog → ./plugins/claude
├── plugins/claude/                   # the Claude Code plugin (self-contained)
│   ├── .claude-plugin/plugin.json    # name "mhk" — drives the /mhk: namespace
│   ├── commands/   init.md · sync.md · add.md
│   ├── agents/     repo-cartographer.md   # read-only scanner (Read/Grep/Glob)
│   ├── playbooks/  backend · frontend · mobile
│   ├── templates/  CLAUDE_TEMPLATE · RULES_TEMPLATE
│   └── schema/     repo-map-schema.md
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

1. `/mhk:init` — scan the repo; review the proposed `CLAUDE.md` diff (plus any `.claude/rules/*.md` and `permissions.deny` proposals); approve/edit/reject per file or per rule. Nothing is written without approval.
2. Work normally — Claude Code loads the repo's `CLAUDE.md` automatically.
3. `/mhk:sync` — periodically, or after a significant refactor; diffs only what changed since the last run.
4. `/mhk:add "rule text"` — record a human-known gotcha directly, skipping detection.

## CLI (placeholder)

The `mhk` CLI is scaffolded but does nothing yet:

```sh
npm i -g minimal-harness-kit   # installs the `mhk` binary
mhk                            # prints a placeholder banner
```

Planned: multi-repo `mhk add-dir`, global `CLAUDE.md` pull/sync, and rendering for non-plugin agents.

## Design principles (why it's built this way)

- **Delta-only rules.** A rule is written only if it contradicts an ecosystem default, is a real (>70%-consistent) but non-obvious convention, or is a cross-cutting gotcha. Generic language/framework best practice is never written down.
- **Explicit invocation only.** All commands run when typed — never model-auto-triggered — the biggest lever against hallucinated mid-task regenerations.
- **Approval-gated writes.** Every command proposes a diff and waits for a yes. `permissions.deny` changes are called out separately since they alter enforced behavior.
- **Hard token budget.** ~80 lines for the repo's `CLAUDE.md`; shared policy stated once and referenced.
- **Least privilege.** `repo-cartographer` has only Read/Grep/Glob — a scan can never have write-level side effects.
- **Capture the reuse surface, not just constraints.** A repo's shared widgets/hooks/helpers/base classes are captured as a compact `name | purpose | where` lookup (never code skeletons), so the LLM reuses them instead of reinventing them.
- **Signpost every scoped rule in `CLAUDE.md`.** A path-scoped `.claude/rules/` file loads only when a matching file is read — absent during planning and file creation — so each scoped file also gets a one-line pointer in the always-loaded `CLAUDE.md`.
- **Playbooks guide where to look, not what to conclude.** `playbooks/` lists categories to investigate per stack; the cartographer still records only what it finds real evidence for.

## Roadmap

- **Phase 1 (now):** the Claude plugin (working, installable) + a placeholder CLI.
- **Phase 2:** extract a shared, tool-neutral `core/` (methodology, playbooks, schema) with a build step that vendors it into each plugin; add a **Codex** plugin wrapping the same methodology.
- **Phase 3:** real CLI — multi-repo launcher, global `CLAUDE.md` sync, and an `AGENTS.md` renderer covering non-plugin agents (Cursor, Gemini CLI, Copilot, Aider, Windsurf, Zed).
