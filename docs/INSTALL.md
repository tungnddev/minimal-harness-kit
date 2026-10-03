# Install

`mhk` has separate Claude Code and Codex plugin packages. Install the package for each agent you use; its workflows then propose files in a target repository for review and commit.

| Layer | Claude Code output | Codex output |
| --- | --- | --- |
| Rules | Rules block in `CLAUDE.md`; `.claude/rules/*.md` | Rules block in `AGENTS.md`; `.mhk/rules/*.md` |
| Memory setup | Memory block in `CLAUDE.md` | Memory block in `AGENTS.md` |
| Shared memory | `.mhk/memory/<slug>.md` and `.mhk/memory/MEMORY.md` | The same store |
| Optional native restrictions | Append-only `permissions.deny` proposals in `.claude/settings.json` | Separately validated proposals in `.codex/config.toml` |

There is no additional `mhk` bookkeeping file. Root blocks and generated-rule markers identify managed guidance; the memory workflow owns the dedicated memory store. Human content outside managed blocks and unmarked rule files is preserved. See [DESIGN.md](DESIGN.md).

## Claude Code

### Per user (interactive)

```sh
claude plugin marketplace add tungnddev/minimal-harness-kit
claude plugin install mhk@minimal-harness-kit
/reload-plugins
```

### Per repo (committed, auto-updating for the whole team)

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

## Codex

Codex supports the same four workflows as Claude Code. Its rules and shared memory are retrieved through instructions in `AGENTS.md`: Codex does not natively load `.mhk/rules/` by `paths:` or import the shared memory index. The plugin supplies the routing instructions for both.

The Codex pack is an independent plugin (`plugins/codex/`) with four explicitly invoked skills: `mhk-rules`, `mhk-rules-add`, `mhk-memory`, and `mhk-doctor`. It has its own catalog, `.agents/plugins/marketplace.json`, separate from the Claude catalog `.claude-plugin/marketplace.json`.

### Per user

```sh
codex plugin marketplace add tungnddev/minimal-harness-kit
codex plugin add mhk@minimal-harness-kit-codex
```

Then start a new Codex session in the target repository. You can also install `mhk` from the **Minimal Harness Kit (Codex)** marketplace in Codex's plugin browser.

To clone only the Codex catalog and package, add `--sparse .agents/plugins --sparse plugins/codex` to the marketplace command. Both paths are required because the catalog points to the package directory.

For a local checkout during development, edit `core/` or `adapters/` and run `npm run build:plugins` first, then add the checkout: `codex plugin marketplace add /path/to/minimal-harness-kit`. The committed `plugins/` packages are complete; normal installs require no build step. See [the maintainer workflow](ARCHITECTURE.md#maintainer-workflow).

**Check you got the Codex package.** The plugin id is `mhk@minimal-harness-kit-codex`. This repository also contains a Claude catalog, which Codex can read, but Codex prefers `.agents/plugins/marketplace.json` when both are present. If the id shows as `mhk@minimal-harness-kit`, Codex did not find the Codex catalog (for example, it was added from an older revision): run `codex plugin marketplace remove minimal-harness-kit` and add it again.

### Use

Inside any target repository:

```sh
codex
> $mhk-rules
> $mhk-memory
> $mhk-doctor
```

`mhk-rules` never runs implicitly. Pass `$mhk-rules migrate` or `$mhk-rules fresh` to choose the mode up front. Otherwise, when an mhk Claude harness exists and no Codex output does, it asks first: **Migrate and verify** (recommended) or **Fresh scan**. It inspects current code, then presents the complete rule diff, and any native-permission diff separately, before writing anything. It never commits.

For the reverse direction in Claude, run `/mhk:rules migrate` to verify and import `AGENTS.md` and `.mhk/rules/` into Claude guidance without modifying Codex files. With only Codex MHK output present, `/mhk:rules` offers migration or fresh discovery before scanning. Existing Claude output defaults to an ordinary Claude rerun unless migration is explicitly requested.

To add one rule in Codex, use `$mhk-rules-add <rule text>` with an optional topic/path. It checks relevant sources and existing guidance, proposes the exact change and any index row, then waits for approval. An existing duplicate produces no change. It leaves native settings, memory, and Claude files untouched. `/mhk:rules-add` provides the same fast path in Claude.

To set up team memory, invoke `$mhk-memory`. It adds a memory block to `AGENTS.md` and creates the `.mhk/memory/` index. From then on, when you correct or explain a project fact the team needs, Codex asks at the end of the task whether to save it. It never reads Codex's own memories, so it works whether or not that feature is on. `/mhk:memory` sets up the Claude memory block and can also sweep native Claude project memories. Run setup once per platform; both plugins reuse the same store without resetting existing facts. Either memory command can be run before rules. See [RULES_AND_MEMORY.md](RULES_AND_MEMORY.md) for capture, maintenance, and migration behavior.

Placing the skill in a repository's `.agents/skills/` is fine for iterating on the skill itself, but it is not the supported install and does not validate the plugin.

### What it produces

- A `<!-- mhk:rules:begin -->` … `<!-- mhk:rules:end -->` rules block in root `AGENTS.md` (roughly 80 lines is a warning threshold, not a required size), containing an index of detailed documents.
- `.mhk/rules/*.md` documents. Their `paths:` frontmatter is mhk metadata. Codex opens a document because the index tells it to (model-directed retrieval), not through automatic glob loading.
- With `$mhk-memory`, a separate memory block in `AGENTS.md` and the shared `.mhk/memory/` index and fact files.
- Optionally, an mhk-owned permission profile in `.codex/config.toml`. This is proposed only when its behavior has been validated against disposable fixtures. Project config requires a trusted project and may need a new session to take effect.

Permission caveats: legacy `sandbox_mode` and newer `default_permissions` profiles do not compose, and a native filesystem `deny` blocks both reads and writes. Scattered generated-file edit restrictions (e.g. `**/*.g.dart`) can therefore remain reported gaps instead of becoming a broad deny that would also break code generators. See the [official permissions reference](https://learn.chatgpt.com/docs/permissions).

`$mhk-rules` never modifies `CLAUDE.md`, `.claude/`, or `.mhk/memory/`. `$mhk-memory` writes only the memory block in `AGENTS.md` and `.mhk/memory/`. `$mhk-doctor` writes nothing: it checks setup, routing, stale references, memory consistency, and Git sharing, then reports which skill or manual action comes next. It does not run tests, verify the truth of guidance, or evaluate native enforcement. Optional layers that are not set up are informational, not errors. `/mhk:doctor` provides the same health check for Claude.

A selected root `AGENTS.override.md` prevents the root `AGENTS.md` blocks from loading. Both Codex setup workflows report this conflict without deleting the override.

## CLI (placeholder)

The `mhk` CLI is scaffolded but does nothing yet:

```sh
npm i -g minimal-harness-kit   # installs the `mhk` binary
mhk                            # prints a placeholder banner
```

Planned: multi-repo `mhk add-dir`, global `CLAUDE.md` pull/sync, and rendering for non-plugin agents.
