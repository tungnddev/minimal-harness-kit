<!-- Generated from adapters/claude/package/templates/MEMORY_TEMPLATE.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

Reference for the committed team-memory store: the format both the capture offer and `/mhk:memory` write. Content is illustrative; do not copy it into a real project.

## The store: `.mhk/memory/`

Committed facts about this repository that a code scan cannot show: invariants, business rules, past incidents, and the reasons behind decisions. One fact per file, plus an index derived from the files.

### Fact file: `.mhk/memory/<slug>.md`

```
---
name: <slug, kebab-case, matching the filename>
description: <one line: what the fact is and when it matters>
metadata:
  node_type: memory
  type: project | reference
---

<the fact, followed by **Why:** and **How to apply:** lines. Link related facts with [[their-slug]].>
```

- `project` covers decisions, invariants, business rules, and incidents; `reference` says where information lives outside the repository.
- Never store secrets, credentials, email addresses, internal hostnames or IPs, machine-local absolute paths, customer data, or opinions about people.
- A fact copied from a native memory store may carry extra `metadata` keys; keep them unchanged. Never add mhk-specific fields.

### Index: `.mhk/memory/MEMORY.md`

The index is derived from the fact files. Regenerate it instead of editing it:

```
# Team memory

Facts about this repository, one file each beside this index. Read the ones relevant to the task.

- [Driver wallet cancel](driver-wallet-cancel.md) — Driver-cancelled trips refund to the in-app wallet, never the card; check before changing cancellation or refund flows
```

- The three header lines are fixed. Then one line per fact file, sorted by filename.
- `[Title]` is the fact's `name` with hyphens and underscores read as spaces and the first letter capitalized; the link is the filename; the text after the dash is the fact's `description`, unchanged.
- Nothing else goes in the file. A hand edit or a merge conflict is repaired by regenerating it.
- With no facts, the index is only the header.

### Who writes here

- **The capture offer** in the memory block: during normal work, the agent may add or correct one fact and its index line, only after the user approves the exact text. It never deletes facts and never commits.
- **`/mhk:memory`**: sets up the memory block and the index, checks existing facts, and proposes additions, corrections, merges, and removals for approval. It never commits.
- Nothing else writes here.

### Checking existing facts

Propose removing or correcting a fact only on evidence: a path, symbol, or command it depends on is gone from the code; a newer fact contradicts or retracts it; or it repeats guidance that already lives in the rules layer. A fact with no native copy on this machine is normal, so that is never a reason to remove it, and the code cannot confirm a non-derivable fact by definition.

## Claude's native memory shape

Fact files keep the shape of Claude Code's native auto-memory files, so a native note can be shared by copying it unchanged, and `/mhk:memory` can compare the two stores key by key, never byte by byte. A change to the native format then shows up as a new or missing key instead of being silently absorbed. As observed in September 2026, a native note looks like this:

```
---
name: <short-kebab-case-slug>
description: <one-line summary, used to decide relevance during recall>
metadata:
  node_type: memory
  type: user | feedback | project | reference
  originSessionId: <id of the session that created the note>
  modified: <ISO 8601 time of the last write>
---

<the fact. For feedback/project, follow with **Why:** and **How to apply:** lines.>
```

Only `project` and `reference` notes are sharing candidates. `user` notes (who the developer is) and most `feedback` notes (how *they* like to work) are personal and stay local.

### Volatile keys

Claude Code stamps these per machine or per write; their values say nothing about the fact:

- `metadata.originSessionId` — the session that created the note on that machine
- `metadata.modified` — the time of the last write

Copy them with a note when it is added or its content changes, but never treat a difference in them, or in YAML formatting such as quoting, as a change. Keep `modified`: it tells readers how old a fact is. When a new native key turns out to be such a stamp, add it to this list.

### Loading

The memory block in `CLAUDE.md` imports the index with `@.mhk/memory/MEMORY.md`, so Claude Code loads it into every session the way it loads native `MEMORY.md`, and opens fact files on demand. Claude Code silently skips the import while the file does not exist, which is why `/mhk:memory` creates the index when it sets up the block.
