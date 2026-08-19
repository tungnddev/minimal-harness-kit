---
description: Record a human-known project-specific rule directly into this repo's rules layer, skipping detection. The manual fast-path companion to /mhk:rules.
argument-hint: "<rule text>"
---

Parse `$ARGUMENTS` as the rule text. Skip the `repo-cartographer` scan entirely — this is the manual fast path for a gotcha you already know. Default target is this repo's `CLAUDE.md` managed block (between `<!-- BEGIN: ai-guide --> … <!-- END: ai-guide -->`); if the rule is clearly a cross-cutting-by-filetype convention (a glob pattern, not a directory-specific fact) and the user names a `.claude/rules/<topic>.md` file, target that instead — a new such file gets the same `paths:` frontmatter and trailing `<!-- mhk:generated -->` marker that `/mhk:rules` writes.

Before adding, sanity-check the rule against the same bar the cartographer uses: if it's a generic language/framework best practice rather than something specific to this codebase, reject it and tell the user why, instead of adding it. If it passes, show the exact line as it would appear inside the target file's managed block (matching the existing rule-list style in that file), wait for confirmation, then append it. If a matching rule already exists, point that out instead of creating a duplicate.

Never invoke this command automatically.
