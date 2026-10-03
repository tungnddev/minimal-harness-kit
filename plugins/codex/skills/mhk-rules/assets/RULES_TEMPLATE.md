<!-- Generated from adapters/codex/package/skills/mhk-rules/assets/RULES_TEMPLATE.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

Shape example for `.mhk/rules/<topic>.md`; content is illustrative, not project policy.

Keep a topic focused: short rules, a useful lookup table, and relevant exemplar pointers with essential wiring. Give detail one home and retain important scope exceptions and settled decisions. Prefer pointers to live code over copied implementations.

`paths:` frontmatter must come first; do not add root block markers. Every owned topic ends with `<!-- mhk:generated -->`. Only that exact marker or the legacy `<!-- mhk:generated - managed by /mhk:rules; edits may be overwritten -->` proves ownership. Preserve unmarked human files. Propose legacy-marker upgrades explicitly in the approved diff; write only the current form.

Codex reaches `.mhk/rules/` documents through the index in `AGENTS.md`. The `paths:` field is scope metadata; it does not cause automatic loading. The index must make the document discoverable during planning and before creating or editing files.

For catalogs, scope paths to consumers; for generated or migration constraints, scope them to affected files and the editing workflow. Name the source and command/cwd for regeneration when relevant. Describe enforcement only as it actually exists: write "is denied" or "is blocked" only when the matching native restriction has been validated using [permissions.md](../references/permissions.md). Otherwise state the instruction without claiming enforcement.

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

Include only supported public entry points that help avoid reinvention. A preference is not a prohibition; preserve explicit project policies regardless of adoption. For discovery criteria, see [repo-cartographer.md](../references/repo-cartographer.md).

For every `.mhk/rules/` document, add a row to the `### Detailed rules and catalogs` table in `AGENTS.md`: the finding's `task` (including creating new files), optional path predicate from `applies_to`, specific coverage from `summary`, and a direct relative link.

For example:

```
| Creating or editing UI/presentation code — screens, widgets, dialogs (`**/presentation/**`) | shared design-system widgets, dialogs, list views, and formatters to reuse | [ui-catalog](.mhk/rules/ui-catalog.md) |
```

Tell Codex to read matching documents during planning and before creating or editing files, without opening every document on every task. These files are not loaded automatically; the index is their retrieval route. A short consequential guardrail can live in the relevant row instead of being repeated above the table. Preserve its scope, and identify any relevant exemplar in the coverage column.

On reruns, preserve useful rules and catalog rows unless a concrete correction or consolidation is justified. Show removals and retained meaning for approval. Do not replace useful lookup entries with a vague summary or split files merely to meet a line target.
