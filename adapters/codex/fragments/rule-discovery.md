For every `.mhk/rules/` document, add a row to the `### Detailed rules and catalogs` table in `AGENTS.md`: the finding's `task` (including creating new files), optional path predicate from `applies_to`, specific coverage from `summary`, and a direct relative link.

For example:

```
| Creating or editing UI/presentation code — screens, widgets, dialogs (`**/presentation/**`) | shared design-system widgets, dialogs, list views, and formatters to reuse | [ui-catalog](.mhk/rules/ui-catalog.md) |
```

Tell Codex to read matching documents during planning and before creating or editing files, without opening every document on every task. These files are not loaded automatically; the index is their retrieval route. A short consequential guardrail can live in the relevant row instead of being repeated above the table. Preserve its scope, and identify any relevant exemplar in the coverage column.
