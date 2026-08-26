# Install

`mhk` is a **globally-installed Claude Code plugin**, not files copied into your repo. Plugin assets live in `~/.claude/plugins/cache/…` and are referenced via `${CLAUDE_PLUGIN_ROOT}`. The only things that land in a target repo are the **generated output you commit**:

```
CLAUDE.md                  # the always-loaded managed block (~80 lines, budgeted)
.claude/rules/*.md         # scoped conventions + reuse-surface catalogs (load on demand)
.claude/settings.json      # permissions.deny hard constraints (append-only)
.mhk/memory/*              # promoted "why", once you run /mhk:memory
```

There is **no `mhk` state or cache file** — the files above *are* the whole state. Ownership is marked *in-band* (a `<!-- BEGIN/END: ai-guide -->` block, an `<!-- mhk:generated -->` marker), so nothing you hand-wrote is ever touched. See [`DESIGN.md`](DESIGN.md).

## A. Per user (interactive)

```sh
claude plugin marketplace add tungnddev/minimal-harness-kit
claude plugin install mhk@minimal-harness-kit
/reload-plugins
```

## B. Per repo (committed, auto-updating for the whole team)

Add to the target repo's `.claude/settings.json`. This commits only a small pointer — no plugin resources land in the repo:

```json
{
  "extraKnownMarketplaces": {
    "minimal-harness-kit": {
      "source": { "source": "github", "repo": "tungnddev/minimal-harness-kit" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": ["mhk@minimal-harness-kit"]
}
```

> Third-party marketplaces have auto-update **off** by default. `"autoUpdate": true` above (or the `/plugin` → Marketplaces toggle) turns it on so updates land automatically, followed by a `/reload-plugins` prompt.

Plugin auto-update then propagates improvements to every repo at once.

## CLI (placeholder)

The `mhk` CLI is scaffolded but does nothing yet:

```sh
npm i -g minimal-harness-kit   # installs the `mhk` binary
mhk                            # prints a placeholder banner
```

Planned: multi-repo `mhk add-dir`, global `CLAUDE.md` pull/sync, and rendering for non-plugin agents.
