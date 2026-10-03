# Rules and memory

This guide describes the workflows shipped in the Claude and Codex packages. For installation, see [INSTALL.md](INSTALL.md); for source layout and package checks, see [ARCHITECTURE.md](ARCHITECTURE.md). Installed-agent acceptance checks are in [GENERATION_EVAL.md](GENERATION_EVAL.md).

## Choose a workflow

| Task | Claude Code | Codex |
| --- | --- | --- |
| Generate or refresh project guidance | `/mhk:rules` | `$mhk-rules` |
| Verify and add one supplied rule | `/mhk:rules-add "rule text"` | `$mhk-rules-add <rule text>` |
| Import the other platform's rules | `/mhk:rules migrate` | `$mhk-rules migrate` |
| Discover from repository sources | `/mhk:rules fresh` | `$mhk-rules fresh` |
| Set up or maintain shared memory | `/mhk:memory` | `$mhk-memory` |
| Inspect surface health without writes | `/mhk:doctor` | `$mhk-doctor` |

Every invocation operates on one repository, including its modules. Rules and memory work independently. For a new setup, run the rules workflow for your platform and review its proposal, then run the memory workflow and review that proposal. Memory can also be set up first, with no facts yet.

For a repository used with both agents, set up each platform's root blocks. Each platform has its own rules documents; both use the same memory directory. Commit approved output yourself so teammates receive it in their checkouts. No workflow commits for you.

## Files and ownership

| Content | Claude Code | Codex |
| --- | --- | --- |
| Root guidance | `CLAUDE.md` | `AGENTS.md` |
| Detailed rules | `.claude/rules/<topic>.md` | `.mhk/rules/<topic>.md` |
| Team facts | `.mhk/memory/<slug>.md` | Same files |
| Derived memory index | `.mhk/memory/MEMORY.md` | Same file |
| Optional native restriction proposals | `.claude/settings.json` | `.codex/config.toml` |

Root files use separate marker pairs, in this order:

```html
<!-- mhk:rules:begin -->
...project rules and topic routing...
<!-- mhk:rules:end -->

<!-- mhk:memory:begin -->
...memory index pointer and capture instructions...
<!-- mhk:memory:end -->
```

The full rules workflow and `rules-add` write only the rules layer. The memory workflow writes only the memory block and store. Each reads the other block as context and preserves its content; text outside the blocks remains human-authored. Duplicate, mixed, or unmatched markers require resolution before the affected block can be written.

Owned rule documents have `paths:` frontmatter and a trailing `<!-- mhk:generated -->` marker. Unmarked rule files are preserved. Older rules-block markers and the long generated-file trailer remain recognized: only the full rules workflow upgrades them, as an explicit part of the approved diff. `rules-add` preserves them.

An old memory pointer inside a rules block stays until that root file has a memory block. Memory setup leaves the old pointer alone; the next full rules run removes it. Neither workflow edits the other layer to complete this transition.

## Rules lifecycle

The full workflow inventories existing guidance, chooses discovery or migration, verifies findings, drafts concise rules, and reviews root and topic documents together. It checks pointers, scope, exceptions, contradictions, duplication, and whether planning or new-file tasks can find relevant guidance. Confirmed project policy survives incomplete adoption in code.

With no owned guidance, the workflow discovers from repository sources. If only the other platform has mhk rules, it offers migration or fresh discovery before deep analysis. An explicit `migrate` or `fresh` selects that mode directly. With existing destination rules and no mode, it re-verifies those rules without importing later changes from the other platform. A fresh scan still preserves existing human policy and ownership boundaries.

Migration verifies source guidance against current evidence and translates it for the destination agent. The source platform stays unchanged. This is an explicit import, not ongoing synchronization.

The complete proposed diff goes to review before writes. Native restrictions receive a separate proposal and approval; guidance alone does not enforce a filesystem or tool restriction. Applied output is read back and checked. Reruns preserve verified wording and settled decisions; supported corrections or concrete audit improvements can produce a proposal. Unchanged, already-audited guidance produces no diff.

`rules-add` follows a shorter path: supplied rule → targeted verification → wording and placement proposal → approval → apply and read back. It can create a minimal rules block or a focused topic and its routing, but does not run the cartographer, change native settings, or maintain memory. An existing duplicate produces no change.

## Memory lifecycle

The first memory run proposes the platform's exact memory block and creates the index if missing, even with zero facts. Existing facts are retained for review. Subsequent runs check facts and regenerate the entire index; current, unchanged state produces no diff.

Once the memory block is installed, the agent may offer to capture a durable fact after the task is done and the user has reviewed it. It quotes the fact and asks once. Approval permits adding or correcting that fact and its index entry; refusal means it should not ask again about the same fact. Capture never deletes facts or commits. It is an instruction in the root block, not a background synchronization process.

| Behavior | Claude Code | Codex |
| --- | --- | --- |
| Recall | Memory block imports the index; relevant fact files are opened as needed | Memory block instructs the agent to read the index and relevant facts before non-trivial work |
| Capture source | A learned team-relevant project/reference fact, usually from a saved native note; writes the same format if no note was saved | A project fact the user corrected or explained |
| Maintenance inputs | Committed facts plus a read-only sweep of native project memory | Committed facts; no native or personal memory access |
| Maintenance output | Approved block, fact changes, and regenerated index | Approved block, fact changes, and regenerated index |

Claude's sweep filters for durable, verified, repository-general facts that code cannot reproduce. It excludes personal and sensitive content, checks duplicates and conflicts, and reports native-format changes. Extra native metadata travels with a fact. Differences only in volatile stamps (`metadata.originSessionId`, `metadata.modified`) or YAML formatting do not justify an update. A conflicting teammate fact is flagged for review, not silently overwritten.

Both workflows can propose corrections, merges, or removals during maintenance. Evidence can include a removed path or symbol, a newer fact retracting an older one, or duplication of guidance already in rules. A fact without a native copy on this machine is normal. Code's inability to prove a non-derivable fact is not grounds for removal. Always-apply instructions belong in rules; memory maintenance can suggest `rules-add`, but cannot write the rules itself.

## Fact and index format

An illustrative fact file, `.mhk/memory/refund-destination.md`:

```markdown
---
name: refund-destination
description: Check the agreed refund destination before changing cancellation flows
metadata:
  node_type: memory
  type: project
---

<The agreed project fact.>

**Why:** <The reason or incident behind it.>
**How to apply:** <When and how this fact affects work.>
```

Use `project` for decisions, invariants, business rules, and incidents; use `reference` for where information lives outside the repository. Related facts can link with `[[their-slug]]`. Preserve extra metadata from copied native notes; add no mhk-specific fields. Never store secrets, credentials, email addresses, internal hostnames or IPs, machine-local absolute paths, customer data, or opinions about people.

The index has this fixed header, followed by one entry per fact sorted by filename:

```markdown
# Team memory

Facts about this repository, one file each beside this index. Read the ones relevant to the task.

- [Refund destination](refund-destination.md) — Check the agreed refund destination before changing cancellation flows
```

The title comes from `name`, replacing hyphens and underscores with spaces and capitalizing the first letter. The description is copied unchanged. With no facts, only the header remains. Maintenance regenerates this file instead of preserving manual edits. An index merge conflict can be repaired by regeneration; conflicting fact contents still need review.

## Retrieval and verification limits

Both platforms support rules and memory. Claude natively loads path-scoped rules, with root signposts for planning and creation, and imports the shared memory index through its memory block. Codex's `paths:` fields are metadata: root index rows direct the agent to open relevant documents. Its memory block similarly instructs the agent to read the shared index and relevant facts. These are differences in retrieval, not missing plugin workflows. A selected root `AGENTS.override.md` replaces `AGENTS.md`, preventing its rules and memory blocks from loading; setup reports this without deleting the override.

Claude discovery excludes memory stores as evidence, even when memory is already in the parent session's context. Codex rules may read committed facts to explain exceptions, but cannot modify the store or read personal memory. Both rules workflows preserve the other platform's files.

## Doctor: setup health and next actions

Run `/mhk:doctor` in Claude Code or `$mhk-doctor` in Codex, optionally specifying a repository path. Both doctors check surface health from one shared checklist: block markers and order, topic routing, `paths:` globs that match nothing, pointers and named scripts that no longer exist, the exact memory block, index consistency, committed-fact safety, and whether mhk files are tracked by Git. Claude's also lists unshared native project facts by slug; Codex's checks for a root `AGENTS.override.md` and never reads personal memory. Each reports its own platform, detects the other platform without auditing its rules, and points to that platform's doctor. It suggests migration only when the current platform lacks a rules block.

Reports use Rules, Memory, Sharing, then the other platform when present, with these marks:

| Mark | Meaning | Example |
| --- | --- | --- |
| `✓` | Healthy | Memory block and index are current |
| `!` | Warning: drift or sharing risk | Empty scope glob, stale pointer, untracked or ignored output |
| `✗` | Error: broken loading, invalid state, or unsafe content | Missing routed topic, malformed block, fact conflict, sensitive data |
| `·` | Information | Optional layer not set up, legacy marker, rule age, tracked edits |

The final line gives error/warning counts and next actions in order, or **Everything looks current.** with optional next steps. Unshared Claude native facts are informational and listed by slug. Sensitive matches are identified only by file and kind; fact bodies are never printed.

Doctor never writes, stages, proposes diffs, offers to run fixes, or runs builds, tests, installs, or deep scans. It does not judge whether a rule or fact is true or whether native restrictions are effective. Rerun rules and memory workflows for content verification; use a human merge for conflicting fact contents. A clean doctor report establishes surface health only.

Package tests and drift checks validate assembly and references. They do not establish installed-agent behavior, native enforcement, capture timing, or fresh-session retrieval. Those need the [manual acceptance checks](GENERATION_EVAL.md).
