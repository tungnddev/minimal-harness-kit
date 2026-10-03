# Architecture

## Source and installable packages

```text
minimal-harness-kit/
├── core/                            # shared, editable source
│   ├── repo-cartographer.md         # neutral discovery method + report contract
│   ├── playbooks/                   # backend, frontend, mobile
│   ├── rules-workflow.md.tmpl       # verification, rendering, complete-draft audit
│   ├── rules-add-workflow.md.tmpl   # one supplied rule: input, verify, review, add
│   ├── root-blocks.md.tmpl          # one marked block per layer in CLAUDE.md / AGENTS.md
│   ├── memory-store.md.tmpl         # shared .mhk/memory format and derived index
│   ├── doctor-workflow.md.tmpl      # read-only checklist and report format for both doctors
│   └── templates/rules.md.tmpl      # rule, catalog, discipline examples
├── adapters/
│   ├── claude/
│   │   ├── package/                # manifest, commands, agent wrapper, root/memory templates
│   │   └── fragments/              # loading, signposts, permission behavior
│   └── codex/
│       ├── package/                # manifest, skills, scan wrapper, migration, permissions, root/memory templates
│       └── fragments/              # loading, index rows, permission behavior
├── scripts/
│   ├── build-plugins.mjs            # deterministic assembly and package validation
│   └── build-plugins.test.mjs
├── plugins/                        # generated, committed, independently installable
│   ├── claude/                     # .claude-plugin/, commands/, agents/, playbooks/, templates/
│   └── codex/                      # .codex-plugin/, skills/mhk-rules{,-add}/, skills/mhk-memory/, skills/mhk-doctor/
├── .claude-plugin/marketplace.json  # catalog → ./plugins/claude
├── .agents/plugins/marketplace.json # catalog → ./plugins/codex
└── cli/                            # consumer CLI placeholder
```

This repository develops the plugins; neither package is automatically loaded while working here. Install a package to use it in a target repository. See [INSTALL.md](INSTALL.md).

## Build-time composition

Edit `core/` for shared behavior and `adapters/<platform>/` for platform behavior. `adapters/<platform>/package/` mirrors the installed package layout. Plain files are copied; `.tmpl` files are expanded and lose that suffix. Shared playbooks are copied into each package. Generated Markdown includes a source notice after any leading YAML frontmatter.

Templates support only two constructs:

- `{{root_file}}`, `{{rules_dir}}`, and other explicitly declared scalars substitute concrete names and paths.
- `{{> rule_discovery }}` and other named fragments insert complete paragraphs. Fragments can include shared content, but cycles are rejected.

Variables, fragment mappings, and playbook destinations are declared in `scripts/build-plugins.mjs`. There are no template conditionals or expressions. Platform behavior is authored in adapter fragments, so installed instructions contain concrete paths and only the relevant loading/enforcement behavior. The model never interprets a term map or template variables. Host-provided syntax such as `${CLAUDE_PLUGIN_ROOT}` and `$ARGUMENTS` remains intact.

The two root templates remain separately authored because their layouts differ. Manifests, invocation metadata, migration handling, native permissions, and scan execution also belong to adapters.

`core/rules-add-workflow.md.tmpl` supplies the compact input/verify/review/add flow to both `/mhk:rules-add` and `$mhk-rules-add`; it does not invoke discovery or alter native settings. `core/root-blocks.md.tmpl` gives every rules and memory workflow the same block-ownership rules for `CLAUDE.md` and `AGENTS.md`. `core/memory-store.md.tmpl` defines the shared `.mhk/memory/` format and derived index, so both plugins write identical stores. `core/doctor-workflow.md.tmpl` gives `/mhk:doctor` and `$mhk-doctor` one read-only checklist and report format, checked against the same block and store contracts; each adapter adds only its routing, loading, and native-memory specifics. Migration references are loaded only in migration mode: Codex imports Claude guidance, and Claude imports Codex guidance. Each preserves source files and translates retrieval and permission intent for its own host.

## Discovery and rendering

The cartographer returns a compact repository overview: commands, useful rules, shared entry points, constraints, and representative exemplars. Findings carry scope, task relevance, a short meaning, inspected source locations, and important exceptions. Existing items retain their source identity for convergence. The report contains no output destinations, root-pointer formatting, or native permission syntax.

The common workflow selects supported findings, drafts concise guidance, and checks the rendered set before user approval. It preserves confirmed policy, checks pointers and obvious contradictions, and keeps detail in one home. Discovery uses representative code and targeted follow-ups rather than exhaustive counts, per-claim evidence tables, or routine task-size reports. Concrete audit improvements may justify approved consolidation on a rerun; otherwise verified content stays stable. Adapter fragments supply discovery, task-loading audit, and permission instructions:

| Concern | Claude | Codex |
| --- | --- | --- |
| Scan execution | Read/Grep/Glob subagent | Skill reference; read-only is an instruction |
| Root output | `CLAUDE.md` rules block | `AGENTS.md` rules block |
| Detailed output | `.claude/rules/<topic>.md` | `.mhk/rules/<topic>.md` |
| Retrieval | Path-scoped loading plus brief planning/creation signposts | Detailed task/coverage/link index; model-directed reads |
| Task audit | Root + all matching/unscoped rule documents; inspect overlap | Selected instruction files + documents selected from task/index rows |
| Native restrictions | Separately reviewed tool-specific deny proposals | Separately evaluated and validated native configuration |

Both plugins implement the memory layer with a shared store and platform-specific loading, capture, and maintenance inputs. Each adapter ships its exact root block as `MEMORY_BLOCK.md`. Claude's imports the index with `@.mhk/memory/MEMORY.md`, so the index loads into every session, and its capture offer copies a saved native project/reference memory, or writes a fact in the same format if none was saved. Codex's points to the index, and its capture offer writes a new fact from the user's correction. The store itself is shared. Memory maintenance regenerates its index from fact metadata; it does not synchronize native personal stores. The full workflow and capture boundaries are documented in [RULES_AND_MEMORY.md](RULES_AND_MEMORY.md).

Plugin assembly happens in this repository. Discovery, review, and harness generation happen later in a consumer repository when the user invokes a command or skill. This build does not synchronize a consumer's Claude and Codex harnesses; their current ownership and migration boundaries remain in their workflows.

## Doctor

Both platforms use `core/doctor-workflow.md.tmpl` to inspect setup health without writes or discovery. The shared checks cover owned blocks and topics, routing, scope and pointer existence, named scripts, memory metadata and index consistency, sensitive-content patterns, and Git sharing. Pointer targets are checked for existence rather than opened for content verification; commands are never executed.

The report orders Rules, Memory, Sharing, then the other platform when detected. It distinguishes errors, warnings, and information, and routes repairs to the owning workflow or a manual action. Optional missing layers and rule age are informational. Adapters add platform-specific loading and configuration checks: Claude can report unshared native fact slugs, while Codex checks overrides and never reads personal memory. Neither doctor validates native enforcement or the truth of guidance.

## Maintainer workflow

With Node.js 22 or newer, no dependency installation is needed for these commands:

```sh
npm run build:plugins
npm test
npm run check:plugins
```

Run `npm install` once to enable the Husky pre-commit hook: every commit then rebuilds `plugins/` and stages it (skip with `HUSKY=0` or `--no-verify`). Commit source changes and regenerated `plugins/` files together. Installers, including sparse checkouts, receive complete packages and need no build step or access to `core/` and `adapters/`. Do not hand-edit generated packages: the next build replaces their contents from source.

`check:plugins` is read-only and fails when outputs are missing or stale. Both modes reject unknown variables/fragments, unsupported or unresolved syntax, fragment cycles, duplicate destinations, missing packaged Markdown references, broken Claude plugin-root references, and missing entry points. Example links to consumer `.mhk/` or `.claude/` documents are not package dependencies. The build validates both packages before writing either one. Unexpected output files are reported for explicit review/removal rather than silently deleted.

CI runs the build tests and the drift check. Tests cover concrete platform output, frontmatter placement, independent package references, repeated builds, read-only drift detection, and failure before writes. Static assembly checks do not cover installed-agent behavior or fresh-session retrieval. Use [GENERATION_EVAL.md](GENERATION_EVAL.md) for manual regression checks when changing either plugin or its host integration.

## Scope

Each invocation covers exactly one repository, including its packages or modules. There is no fan-out across repositories or per-module harness generation. See [DESIGN.md](DESIGN.md) for the content and ownership principles.
