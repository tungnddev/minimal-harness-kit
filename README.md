# Minimal Harness Kit (`mhk`)

> Teach Claude Code your repo — without the rule bloat.

`mhk` does two jobs for AI-assisted coding:

1. **Generate** the harness for a non-AI-native repo — it reads your codebase and writes the small set of *project-specific* rules that actually make an AI agent better at *your* repo. No 300-line `CLAUDE.md` of generic best practices, no hidden state file.
2. **Sync** that harness across machines — so every checkout and every teammate runs the agent with the same, best-quality context, not just the machine it was tuned on.

Everything it produces is a plain, committed file you can read, edit, and diff.

## Components

`mhk` builds the harness out of a few independent pieces. Each is introduced on its own so it can grow over time.

### Rules — derived from your code

A read-only scan of your code infers what the model would otherwise get wrong: the repo's real commands, its project-specific conventions, the shared helpers worth reusing, and the files that must never be edited. A rule is written **only** when it's a real, non-obvious, project-specific fact — never generic best practice.

- **`/mhk:rules`** — scan and converge the rules. Idempotent: proposes everything on a fresh repo, only the drift on a tuned one. The first run *is* onboarding.
- **`/mhk:rules-add "rule text"`** — the manual fast path: record a gotcha you already know, skipping the scan.

### Memory — accumulated as you work

The knowledge a scan **can't** show — invariants, war-stories, the *why*. Claude builds this up in its local auto-memory as you work, but that store is machine-local, so a fresh checkout never inherits it.

- **`/mhk:memory`** — promote the durable, repo-general, non-sensitive slice into a committed `.mhk/memory/` store, so a fresh checkout starts as tuned as your machine. Read-only on native memory; scrubs anything personal or secret.

### And a way to check

- **`/mhk:doctor`** — a read-only overview of what exists, what looks stale, and which command to run next. Writes nothing.

Every command runs **only when you type it**, proposes a **diff**, and waits for your approval before writing. Nothing is ever auto-triggered mid-task. → [`docs/DESIGN.md`](docs/DESIGN.md)

## Quick start

`mhk` ships as a globally-installed Claude Code plugin — not files copied into your repo.

```sh
claude plugin marketplace add tungnddev/minimal-harness-kit
claude plugin install mhk@minimal-harness-kit
/reload-plugins
```

Then, inside any repo:

```sh
/mhk:rules        # scan → review the diff → approve. Nothing is written without a yes.
                  # then work normally — Claude Code loads CLAUDE.md automatically.
/mhk:memory       # promote the durable "why" so teammates inherit it.
/mhk:doctor       # anytime — see what exists and what to run next.
```

Team install (committed + auto-updating) and the CLI placeholder → [`docs/INSTALL.md`](docs/INSTALL.md).

## Roadmap

- **Phase 1 (now):** the Claude Code plugin — working and installable.
- **Phase 2:** a **Codex** variant wrapping the same methodology, so the harness isn't Claude-only.
- **Phase 3:** a real `mhk` CLI — multi-repo sync, global `CLAUDE.md` utilities, and rendering for non-plugin agents.

## Learn more

- 📐 [`docs/DESIGN.md`](docs/DESIGN.md) — the design principles and the *why* behind every choice.
- 🛠️ [`docs/INSTALL.md`](docs/INSTALL.md) — per-user vs. per-team install, auto-update, CLI placeholder.
- 🗺️ [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the monorepo layout and how the plugin fits together.

---

**Brand / npm / marketplace:** `minimal-harness-kit`  ·  **Plugin id + CLI bin:** `mhk`
