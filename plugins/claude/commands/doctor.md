---
description: Read-only overview of the mhk-managed layers in this repo — what exists, what looks stale or missing, and which command to run next. Writes nothing.
argument-hint: "[path]"
---

Give a fast, **read-only** health overview of what mhk manages in `${ARGUMENTS:-the current repository}`. `doctor` diagnoses; it never writes, never proposes a diff, and never runs the deep scan — it points you at the command that does. Safe to run anytime.

Do NOT invoke the `repo-cartographer` scan — that belongs to `/mhk:rules`. `doctor` only reads files already in the repo (plus the native memory store, read-only) and reports their presence and surface state. Report one line per item, then a summary.

**Derived layer — owned by `/mhk:rules`**
- **CLAUDE.md** — present? Does it have the `<!-- BEGIN: ai-guide --> … <!-- END: ai-guide -->` managed block? Roughly how many rules (high vs "unconfirmed")? Flag if the block is missing (→ run `/mhk:rules`), or if there's a CLAUDE.md with no markers (hand-written — `/mhk:rules` will add a block alongside it, not overwrite it).
- **Scoped rules** — how many `.claude/rules/*.md` files, and which carry the `<!-- mhk:generated -->` marker (mhk-owned) vs are hand-written (mhk leaves those alone). Flag any CLAUDE.md signpost whose target file is missing, and any mhk-generated rules file with no signpost.
- **Hard constraints** — is there a `permissions.deny` array in `.claude/settings.json`, and how many entries?
- **Exemplars** — how many `mirror <path>` pointers in the managed block, and whether any pointer's canonical path no longer exists (→ `/mhk:rules` to re-resolve).

**Memory layer — owned by `/mhk:memory`**
- **Promoted store** — how many `.mhk/memory/<slug>.md` facts, and is `.mhk/memory/MEMORY.md` present and consistent with them (a pointer with no file, or a file with no pointer, is a flag)?
- **Stranded native facts** — read the native auto-memory store (read-only) and count facts that look repo-general (`type: project`/`reference`) but are NOT yet promoted → suggest `/mhk:memory` to review them. Do **not** print sensitive content; report counts and slugs only.
- **CLAUDE.md pointer** — is the static `### Project memory` pointer to `.mhk/memory/MEMORY.md` present in the managed block? (If missing, `/mhk:rules` adds it.)

End with a one-line summary and the specific next command(s) to run — or "everything looks current" if nothing is flagged. Never write anything; every fix is another command's job, run deliberately by the user.

Never invoke this command automatically.
