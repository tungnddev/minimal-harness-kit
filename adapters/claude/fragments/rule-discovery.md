For every `.claude/rules/` document, add a one-line signpost under `### Reuse before building new` in `CLAUDE.md`. Use the finding's `task` and `summary` to make its relevance clear during planning and file creation, before a matching read loads the scoped document. Keep the detail in that document.

For example:

```
- UI: reuse the shared widget/dialog catalog before building new ones — see .claude/rules/ui-catalog.md
```

Keep short, consequential guardrails discoverable in the root even when their details live in a scoped document. Where possible, combine the guardrail and signpost in one line instead of adding a duplicate rule above it. Preserve applicability; visibility must not turn a scoped requirement into a global one. Mention relevant exemplars in the topic's signpost when needed for planning.
