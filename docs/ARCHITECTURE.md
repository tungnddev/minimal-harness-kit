# Architecture

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

This repo is the plugin **source**, not a consumer — so the commands and agent aren't loaded when you work here. Install the plugin (see [`INSTALL.md`](INSTALL.md)) to use them.

## How the pieces fit

- **`commands/`** — the four slash commands (`/mhk:rules`, `/mhk:rules-add`, `/mhk:memory`, `/mhk:doctor`). Each is explicitly invoked, proposes a diff, and gates every write on approval.
- **`agents/repo-cartographer.md`** — the read-only scanner behind `/mhk:rules`. It has only Read/Grep/Glob, so a scan can never have write-level side effects.
- **`playbooks/`** — per-archetype guidance (backend / frontend / mobile) the scan draws on.
- **`templates/`** — the shapes for the generated `CLAUDE.md` block, scoped rules files, and promoted memory files.

## Scope

`mhk` always operates on exactly one repo — no monorepo fan-out and no spanning multiple git repositories. Run the commands inside each repo separately.

See [`DESIGN.md`](DESIGN.md) for the principles that shaped this structure.
