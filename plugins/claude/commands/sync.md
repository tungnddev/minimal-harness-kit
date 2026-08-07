---
description: Re-scan this repo for drift since the last /mhk:init (changed conventions, new gotchas) and propose incremental diffs only where something actually changed.
argument-hint: "[path]"
---

If `.mhk/repo-map.yaml` does not exist yet, tell the user to run `/mhk:init` first — do not attempt a partial sync without a baseline.

Otherwise: read `.mhk/repo-map.yaml`, then use the `repo-cartographer` subagent to re-scan `${ARGUMENTS:-the current repository}` and diff its new report against the cached map:

- changed language/framework/commands
- new rule candidates (main list, reuse-surface catalog, cross-cutting-by-filetype, or hard-constraint)
- drift in an existing reuse-surface catalog (a shared widget/helper renamed, moved, or newly added enough to be worth listing; an entry whose target no longer exists)
- previously-surfaced rule candidates whose evidence no longer holds (e.g. a convention that's since become inconsistent, been superseded, or a hard constraint that no longer applies)

Propose a diff touching **only** the CLAUDE.md sections (including any signpost lines whose scoped file changed), `.claude/rules/*.md` files, and `permissions.deny` entries that actually changed — never regenerate a file that has no detected drift. Keep `permissions.deny` changes labeled separately from documentation changes, same as `/mhk:init` does. Present the diff per file, wait for explicit approval, write only what's approved, then update `.mhk/repo-map.yaml`.

Never invoke this command automatically.
