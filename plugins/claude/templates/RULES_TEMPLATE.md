<!-- Generated from adapters/claude/package/templates/RULES_TEMPLATE.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

Shape example for `.claude/rules/<topic>.md`; content is illustrative, not project policy.

Keep a topic focused: short rules, a useful lookup table, and relevant exemplar pointers with essential wiring. Give detail one home and retain important scope exceptions and settled decisions. Prefer pointers to live code over copied implementations.

`paths:` frontmatter must come first; do not add root block markers. Every owned topic ends with `<!-- mhk:generated -->`. Only that exact marker or the legacy `<!-- mhk:generated - managed by /mhk:rules; edits may be overwritten -->` proves ownership. Preserve unmarked human files. Propose legacy-marker upgrades explicitly in the approved diff; write only the current form.

Claude Code loads a `.claude/rules/` document when it reads a file matching the document's `paths:` globs. It may not be loaded during planning or when creating a new file, so every document also needs a signpost in `CLAUDE.md`.

For catalogs, scope paths to consumers; for generated or migration constraints, scope them to affected files and the editing workflow. Name the source and command/cwd for regeneration when relevant. Describe enforcement only as it actually exists: write "is denied" or "is blocked" only when a matching `permissions.deny` entry in `.claude/settings.json` covers the claimed tool operation. Otherwise state the instruction without claiming enforcement.

```markdown
---
paths:
  - "**/presentation/**"
---

# UI development

Prefer the shared theme for ordinary screen text. Preserve specialized component styles where needed.

| Name | Purpose | Import / location |
| --- | --- | --- |
| `UIAppBar` | standard app bar | `package:ui/ui.dart` |
| `showConfirmDialog` | confirm/cancel dialog | `package:ui/ui.dart` |

<!-- mhk:generated -->
```

Include only supported public entry points that help avoid reinvention. A preference is not a prohibition; preserve explicit project policies regardless of adoption. For discovery criteria, see [repo-cartographer.md](../agents/repo-cartographer.md).

For every `.claude/rules/` document, add a one-line signpost under `### Reuse before building new` in `CLAUDE.md`. Use the finding's `task` and `summary` to make its relevance clear during planning and file creation, before a matching read loads the scoped document. Keep the detail in that document.

For example:

```
- UI: reuse the shared widget/dialog catalog before building new ones — see .claude/rules/ui-catalog.md
```

Keep short, consequential guardrails discoverable in the root even when their details live in a scoped document. Where possible, combine the guardrail and signpost in one line instead of adding a duplicate rule above it. Preserve applicability; visibility must not turn a scoped requirement into a global one. Mention relevant exemplars in the topic's signpost when needed for planning.

On reruns, preserve useful rules and catalog rows unless a concrete correction or consolidation is justified. Show removals and retained meaning for approval. Do not replace useful lookup entries with a vague summary or split files merely to meet a line target.
