<div align="center">

# Minimal Harness Kit

### Teach your AI agent how your project works.

Turn your codebase into useful rules. Turn team decisions into shared memory.<br>
Keep both in Git, ready for the next session and the next teammate.

**Claude Code · Codex · Plain Markdown · You approve every change**

[Get started](#get-started) · [How it works](#how-it-works) · [Documentation](#documentation)

</div>

---

Your project has a way of doing things: the command that actually runs the tests, the helper everyone should reuse, the business rule behind an unusual implementation. That knowledge is spread across code, conversations, and people's heads.

**`mhk` turns that knowledge into project context your AI agent can use.** It scans your repository for useful rules and helps you capture the decisions code cannot explain. Review the changes, commit them, and share them with your team.

## Explain less. Keep what your team learns.

| What your agent needs to know | How `mhk` helps |
| --- | --- |
| **How to work in this repo** | Finds real commands, project conventions, shared helpers, and examples worth following. |
| **Why things work this way** | Saves approved decisions, business rules, and lessons from past incidents as team memory. |
| **What the team already knows** | Keeps context in versioned files that travel with every checkout. |
| **What matters for this task** | Organizes guidance into a small root document and focused topics with pointers to relevant details. |

For example, a scan can find your shared payment helper. A team memory can explain **why cancelled trips refund to a wallet**. Your agent needs both kinds of knowledge to make a useful change.

## How it works

### 1. Give your agent a map of the project

Run the rules workflow. `mhk` inspects your code and project policy, then proposes concise guidance: commands, conventions, reusable components, and source examples. You review the complete diff before it writes.

### 2. Keep the knowledge code cannot show

Set up team memory. When you explain a durable project fact during normal work, the agent can offer to save it after the task. You approve the fact; it becomes a note in `.mhk/memory/` for future sessions and teammates.

### 3. Share it through your normal Git workflow

Commit the approved files. Teammates receive the same project knowledge with their checkout. Rerun `mhk` as the project changes to review stale guidance and keep the memory index current.

**You stay in control.** The output is readable Markdown. Existing human guidance is preserved. Native permission changes get a separate review. `mhk` never commits for you.

## Get started

### Claude Code

Install the plugin from your terminal:

```sh
claude plugin marketplace add tungnddev/minimal-harness-kit
claude plugin install mhk@minimal-harness-kit
```

Then, in Claude Code inside your project:

```text
/reload-plugins
/mhk:rules          # Discover project guidance and review the proposed changes
/mhk:memory         # Set up shared memory and offers to capture new facts
```

Start with either layer, or use both. Once you approve the output, commit it with your project.

### Codex

Install the plugin from your terminal:

```sh
codex plugin marketplace add tungnddev/minimal-harness-kit
codex plugin add mhk@minimal-harness-kit-codex
```

Then start a new Codex session inside your project:

```text
$mhk-rules         # Discover or verify project guidance
$mhk-memory        # Set up the same shared team-memory store
```

Both plugins include rules, one-rule additions, shared team memory, and a read-only doctor.

[Team installation and update options →](docs/INSTALL.md)

## Rules

Give your agent the project knowledge it needs to write code that fits: real commands, conventions, shared helpers, and examples. Generate or refresh guidance from your repository, or add one specific rule with a focused review.

| Command | Claude Code | Codex |
| --- | --- | --- |
| Generate or refresh rules | `/mhk:rules` | `$mhk-rules` |
| Add one specific rule | `/mhk:rules-add "rule text"` | `$mhk-rules-add <rule text>` |

Claude loads scoped rules natively; Codex follows the topic index in `AGENTS.md`. Both workflows show the proposed changes for your approval.

[Explore rules: generation, additions, and migration →](docs/RULES_AND_MEMORY.md#rules-lifecycle)

## Memory

Keep the decisions, business rules, and lessons that code cannot explain. Set up team memory once, then approve the facts your agent offers to save as you work. Rerun the command to review existing facts and refresh the index.

| Command | Claude Code | Codex |
| --- | --- | --- |
| Set up or maintain team memory | `/mhk:memory` | `$mhk-memory` |

Both agents share `.mhk/memory/` through Git. Claude imports the index and can review native project memories for sharing; Codex follows the memory instructions in `AGENTS.md` without reading personal memory.

[Explore memory: capture, sharing, and maintenance →](docs/RULES_AND_MEMORY.md#memory-lifecycle)

## What's next

We're exploring project tool selection and work verification: helping teams choose useful AI capabilities, share that setup, and check completed work. These are [proposed next steps](docs/NEXT_PHASE.md). The standalone CLI is currently a placeholder.

## Documentation

- [Rules and Memory](docs/RULES_AND_MEMORY.md) — the complete workflow for both agents.
- [Installation](docs/INSTALL.md) — personal and team setup.
- [Design](docs/DESIGN.md) — principles behind the project.
- [Architecture](docs/ARCHITECTURE.md) — source layout and contributor workflow.
- [Evaluation](docs/GENERATION_EVAL.md) — how to check generation, retrieval, and stable reruns.

Contributing? Edit shared behavior in `core/` and platform behavior in `adapters/`, then run:

```sh
npm run build:plugins
npm test
npm run check:plugins
```

The `plugins/` directories contain the generated installable packages. See the [maintainer guide](docs/ARCHITECTURE.md#maintainer-workflow).
