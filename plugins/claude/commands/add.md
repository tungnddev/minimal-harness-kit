---
description: Fast path to record a human-known project-specific rule directly into this repo's CLAUDE.md, skipping full detection.
argument-hint: "<rule text>"
---

Parse `$ARGUMENTS` as the rule text. Skip the `repo-cartographer` scan entirely — this is the manual fast path. Default target is this repo's `CLAUDE.md`; if the rule is clearly a cross-cutting-by-filetype convention (a glob pattern, not a directory-specific fact) and the user's phrasing names a `.claude/rules/<topic>.md` file, target that instead.

Before adding, sanity-check the rule against the same bar the cartographer uses: if it's a generic language/framework best practice rather than something specific to this codebase, reject it and tell the user why, instead of adding it. If it passes, show the exact line as it would appear inside the target file's managed block (matching the existing rule-list style in that file), wait for confirmation, then append it. If a matching rule already exists, point that out instead of creating a duplicate.
