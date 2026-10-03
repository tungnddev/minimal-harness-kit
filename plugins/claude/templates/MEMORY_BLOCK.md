<!-- Generated from adapters/claude/package/templates/MEMORY_BLOCK.md; edit core/ or adapters/ and run npm run build:plugins. -->

Exact memory block for `CLAUDE.md`. `/mhk:memory` writes everything from the begin marker to the end marker verbatim and keeps it unchanged on reruns. Keep the `@` path outside backticks and followed by a space, or Claude Code does not import it.

<!-- mhk:memory:begin -->
## Team memory
Shared facts about this repository: @.mhk/memory/MEMORY.md — read the entries relevant to the task.

When you learn a project fact that everyone working on this repository would need — usually as you save a project or reference memory — offer to share it:
- Only facts the code can't show; nothing personal or sensitive.
- Ask once, after the task is done and the user has reviewed it, quoting the fact.
- On yes, copy your saved memory file unchanged into `.mhk/memory/` (if you saved none, write one in the same format) and add `- [<Title>](<file>) — <description>` to `.mhk/memory/MEMORY.md` in filename order. Never commit.
- On no, don't ask again about that fact.
<!-- mhk:memory:end -->
