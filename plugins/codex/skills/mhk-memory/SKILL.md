---
name: mhk-memory
description: Set up and maintain a repository's shared team memory for Codex — the AGENTS.md memory block and the committed .mhk/memory store. Use only when explicitly invoked.
---

<!-- Generated from adapters/codex/package/skills/mhk-memory/SKILL.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

# mhk memory for Codex

Own one repository's **memory layer**: the memory block in root `AGENTS.md` and everything under `.mhk/memory/`. The layer holds what a code scan can't show — invariants, business rules, past incidents, the *why* — and shares it with every checkout. It works with or without the rules layer (`$mhk-rules`). Operate only on explicit invocation.

The first run sets the layer up, even with nothing stored yet; later runs keep it current. Unchanged, current state produces no diff. Facts arrive during normal work through the **capture offer** in the memory block: when the user corrects or explains a project fact the whole team needs, Codex asks at the end of the task whether to save it. This skill never reads Codex's own memories or any personal memory store.

### mhk blocks in `AGENTS.md`

mhk writes to `AGENTS.md` only inside its own marked blocks, and each block belongs to exactly one workflow:

| Block | Markers | Owner |
| --- | --- | --- |
| Rules | `<!-- mhk:rules:begin -->` … `<!-- mhk:rules:end -->` | `$mhk-rules` |
| Memory | `<!-- mhk:memory:begin -->` … `<!-- mhk:memory:end -->` | `$mhk-memory` |

- Write only your own block. Read the other mhk blocks as context, so you neither duplicate nor contradict them; never edit, reorder, or adopt their content.
- Everything outside mhk blocks is human-authored: preserve it, and read it as policy/context.
- Blocks keep this order: rules, then memory. Place a missing block after any mhk block that comes before it in this order, otherwise at the end of the file. Create `AGENTS.md` if it does not exist.
- Validate your block's markers before writing. A duplicate, mixed, or unmatched pair is a conflict: stop and ask.
- The rules block's older markers — `<!-- mhk:managed:begin -->` … `<!-- mhk:managed:end -->` and `<!-- BEGIN: ai-guide -->` … `<!-- END: ai-guide -->` — still mark the rules block. Only the full rules workflow upgrades them, as a separately labelled line in its approved diff.

## 1. Inventory (read-only)

Read root `AGENTS.md` and any `AGENTS.override.md`, the fact files and index under `.mhk/memory/` (format: [MEMORY_TEMPLATE.md](assets/MEMORY_TEMPLATE.md)), and, as context only, the rules block and `.mhk/rules/`. Record what you read, so you can detect changes before applying. A selected root `AGENTS.override.md` replaces `AGENTS.md`: report that the memory block will not load while it does.

## 2. Set up the layer

Converge the memory block to the exact content of [MEMORY_BLOCK.md](assets/MEMORY_BLOCK.md). If `.mhk/memory/MEMORY.md` does not exist, create it with the index header. If the rules block still contains an older memory pointer (a line pointing at `.mhk/memory/MEMORY.md`), leave it: it belongs to the rules block, and the next `$mhk-rules` run removes it. Say so in the report.

## 3. Check facts

Check every fact by the store's rules. Scrub anything sensitive: a secret, credential, email address, internal hostname, machine-local path, customer data, or opinion about a person must never stay in a committed fact. If a fact reads like an always-apply instruction rather than context, say so and offer its text for `$mhk-rules-add`; never edit rules files yourself.

## 4. Review and apply

Regenerate the index from the fact files; this also repairs hand edits and merge conflicts. Present the complete proposed diff — the memory block, fact changes, and the index — with a one-line reason per change. Write nothing before approval.

Immediately before writing, re-read everything you recorded; if anything changed, refresh the proposal and ask again. After writing, read back against the approved content, and check that the memory block's markers are single and well-formed and every index link resolves. Leave `CLAUDE.md`, `.claude/`, `.codex/`, `.mhk/rules/`, and the rules block unchanged. Never commit.
