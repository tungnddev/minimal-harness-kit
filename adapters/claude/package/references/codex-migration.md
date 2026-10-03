# Verify and import Codex guidance

Read this only for `/mhk:rules migrate`. Import useful guidance from this repository's Codex harness into Claude; leave the source harness unchanged. Do not run a fresh scan for unrelated conventions.

## Inventory and verify

Read the root `AGENTS.md` rules block and `.mhk/rules/`, recognizing current and legacy MHK markers. Resolve duplicate, mixed, or malformed source blocks before importing. Include each rule, command, index row, catalog entry, exemplar, settled decision, and restriction. Include marked topics without index links and unmarked topics explicitly linked by the managed index; flag missing links/targets. Unmarked, unlinked content is human policy/context, not importable generated state. If no Codex MHK source exists, report that instead of inventing a migration.

Read relevant `AGENTS.override.md` or nested instruction files only to understand conflicts and scope; do not automatically import them as repository-wide rules. Inspect project `.codex/config.toml` only as needed to understand claimed restrictions; never read personal configuration. Keep `.mhk/memory/` and personal memory out of policy evidence for this workflow.

Keep a temporary source/destination snapshot outside the repository, including existence, contents or digests, and source-tree membership for `AGENTS.md`, `AGENTS.override.md`, `.mhk/rules/`, and `.codex/`. Do not follow out-of-repository symlinks. Report incomplete preservation checks.

For each imported item, record its source and whether it is supported, needs correction, is obsolete, or remains unresolved. Use targeted reads to check names, locations, commands/cwd, scope, and relevant wiring. Preserve explicit policy and settled choices despite code differences. Explain each omission; never silently discard an item or carry historical counts forward as current facts.

## Translate and review

- Keep useful topic filenames, lookup rows, scope, and wording. Translate `.mhk/rules/` links into `.claude/rules/`, including links between topics.
- Replace the detailed Codex root index with concise Claude signposts covering the same tasks. Retain paths for automatic scoped loading and signposts for planning/new files. Translate model-directed retrieval language; do not copy it as Claude loading behavior.
- Keep exemplars with their topics and essential wiring. Do not migrate the Codex memory block or memory pointers: `/mhk:memory` sets up Claude's own memory block. Never copy memory content into rules.
- Treat Codex permission/profile claims as source intent, not Claude enforcement. Retain instructional constraints; separately propose only supported `permissions.deny` additions through the command's normal configuration review. Report unsupported or unverified mappings. Never copy or modify Codex configuration.
- If Claude guidance already exists, reconcile imported items with it. Preserve Claude-specific decisions and human content; show conflicts and proposed resolutions. Never overwrite an unowned destination topic; choose a non-colliding name or ask.

Use the command's normal draft review and independent content/settings approvals. Show the source-to-destination mapping and reasons for corrections, omissions, or unresolved items. Selecting migration mode does not approve writes.

Before applying, compare sources and destinations with the snapshot; changed evidence requires a refreshed proposal and approval. After applying, verify the approved outputs, links, and markers, and confirm the Codex source files/trees are unchanged, including additions or deletions. Report mismatches; never overwrite concurrent edits to make preservation pass. Normal later `/mhk:rules` runs update Claude guidance only; import Codex again only on explicit migration.
