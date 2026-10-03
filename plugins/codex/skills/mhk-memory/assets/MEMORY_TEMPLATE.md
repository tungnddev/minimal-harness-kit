<!-- Generated from adapters/codex/package/skills/mhk-memory/assets/MEMORY_TEMPLATE.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

Reference for the committed team-memory store: the format both the capture offer and `$mhk-memory` write. Content is illustrative; do not copy it into a real project.

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
- **`$mhk-memory`**: sets up the memory block and the index, checks existing facts, and proposes additions, corrections, merges, and removals for approval. It never commits.
- Nothing else writes here.

### Checking existing facts

Propose removing or correcting a fact only on evidence: a path, symbol, or command it depends on is gone from the code; a newer fact contradicts or retracts it; or it repeats guidance that already lives in the rules layer. A fact with no native copy on this machine is normal, so that is never a reason to remove it, and the code cannot confirm a non-derivable fact by definition.

### Loading

The memory block in `AGENTS.md` points Codex to the index. Codex reads it before non-trivial work and opens fact files on demand; nothing loads automatically.
