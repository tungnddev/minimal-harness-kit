# Recommendations from claude-mem

These recommendations come from reviewing [claude-mem](https://github.com/thedotmack/claude-mem) v13.31.0 (commit `38870f1`, 2026-10-05). Each is filtered through mhk's principles: approval-gated writes, prompt-only, no runtime, and minimal maintenance.

Suggested order: items 2–4 together (small prompt edits to `core/memory-store.md.tmpl` and the memory block), then item 1, then item 5 after a design discussion.

## Adopt

### 1. Give the memory index a size budget

**Learned from:** claude-mem caps its injected context at 10,000 characters and fits it by measuring, dropping the cheapest loss first (`src/services/context/ContextBudget.ts`).

**Gap in mhk:** `@.mhk/memory/MEMORY.md` is loaded every session and grows linearly with the store, with no cap.

**Change:**
- Add a budget to `core/memory-store.md.tmpl`: a maximum length for each `description` (around 150 characters) and a soft cap on the whole index.
- `/mhk:doctor` flags an index that is over budget.
- When the index is over budget, `/mhk:memory` proposes merges or retirements, cheapest loss first, for approval.
- Keep this prompt-only; no script-backed checks.

### 2. Add a "don't offer" list to the capture offer

**Learned from:** claude-mem's observer prompt has explicit `recording_focus` and `skip_guidance` lists (`plugin/modes/code.json`).

**Gap in mhk:** the memory block only says "facts the code can't show", so the offer can be noisy.

**Change:** add a short skip list to the memory block and the store spec:
- what changed or was refactored (that is git history);
- feature descriptions;
- outcomes of debugging that is already fixed;
- anything already in the index, even if worded differently.

Also name what to offer: a decision with its rationale, a gotcha or trap, a trade-off, an incident, a business rule.

### 3. Check for duplicates before offering

**Learned from:** claude-mem's observer checks its own earlier records before writing, and its near-duplicate detector (`src/services/dedup/`) uses an IDF veto: two near-identical titles that differ in one rare token are distinct.

**Gap in mhk:** the capture offer goes straight to "copy the file and add an index line".

**Change:**
- Before offering, check the index. If an existing fact already covers it, offer to update that fact file instead of adding a new one.
- State in the store spec that facts which differ only in a rare, discriminating token (`rdlp-api` vs `rdlp-plugin`) are separate facts and must not be merged.

### 4. Add a deterministic secret backstop and a `<private>` convention

**Learned from:** claude-mem always strips `<private>…</private>` spans before storing anything (`src/utils/tag-stripping.ts`). It can also redact secrets with 11 built-in regexes (`src/utils/redaction.ts`), but that is opt-in (`CLAUDE_MEM_REDACT_ENABLED`, default `false`).

**Gap in mhk:** the sensitive scrub relies only on the model's judgement plus human review.

**Change:**
- Add a pattern list to the sensitive-scrub step of both the capture offer and the `/mhk:memory` sweep. The model checks proposed text against it: `sk-…`, `AKIA…`, `-----BEGIN … PRIVATE KEY-----`, `ghp_…`, `xox[bp]-…`.
- Content the user wrapped in `<private>…</private>` is never offered or shared.

### 5. Optional file anchors in facts (discuss first)

**Learned from:** claude-mem indexes observations by `files_read` and `files_modified`. That powers recall by file and its File Read Gate.

**Gap in mhk:** facts mention paths only in prose, so retrieval and staleness checks rely on inference.

**Change:** allow an optional `Applies to: <path>, …` line in the fact *body*. It goes in the body because the store forbids mhk-specific frontmatter fields. This helps in two places:
- **Retrieval:** the agent picks facts by the files it is touching.
- **Staleness:** "a referenced path is gone" becomes a mechanical check, which strengthens removal-on-evidence.

This changes the fact format, so settle the design before implementing it.

### 6. Keep generated content BMP-safe

**Learned from:** claude-mem hit a bug where emoji outside Unicode's Basic Multilingual Plane (BMP) were split during context truncation, which bricked sessions. It now uses BMP-only markers.

**Change:** add a one-line note in `core/`: generated content uses only BMP characters. The current doctor symbols (✓ ! ✗ ·) are already safe.

## Already validated, no change needed

- **In-band ownership.** claude-mem's `<claude-mem-context>` tags in CLAUDE.md, with user content preserved outside them, are the same pattern as mhk's marked blocks.

## Do not adopt

| claude-mem feature | Why not |
| --- | --- |
| Hook-based automatic capture, background worker, SQLite/vector database | Breaks "you approve every change", costs model tokens on every tool call, and brings back the maintenance burden the redesign removed. Unreviewed observations don't belong in a committed store. |
| File Read Gate (PreToolUse on Read) | Intercepts reads and needs a database. |
| Session summaries and work-state handoff | Personal and short-lived, so out of scope for team memory. |
| ACT-R reinforcement ranking | Needs usage telemetry mhk does not collect. It is off by default in claude-mem too. |
| Reading claude-mem's database as a `/mhk:memory` sweep source | Adds a SQLite dependency for a niche benefit. Revisit only if users ask. |
