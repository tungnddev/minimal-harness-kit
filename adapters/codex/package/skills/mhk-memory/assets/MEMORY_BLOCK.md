Exact memory block for `AGENTS.md`. `$mhk-memory` writes everything from the begin marker to the end marker verbatim and keeps it unchanged on reruns.

<!-- mhk:memory:begin -->
## Team memory
Shared facts about this repository are indexed in `.mhk/memory/MEMORY.md`. Before non-trivial work, read it and the entries relevant to the task.

When the user corrects or explains a project fact that everyone working on this repository would need, offer to save it:
- Only facts the code can't show; nothing personal or sensitive.
- Ask once, after the task is done and the user has reviewed it, quoting the fact.
- On yes, write `.mhk/memory/<slug>.md` — frontmatter `name: <slug>`, a one-line `description`, and `metadata` with `node_type: memory` and `type: project`, then the fact with **Why:** and **How to apply:** lines — and add `- [<Title>](<slug>.md) — <description>` to `.mhk/memory/MEMORY.md` in filename order. Never commit.
- On no, don't ask again about that fact.
<!-- mhk:memory:end -->
