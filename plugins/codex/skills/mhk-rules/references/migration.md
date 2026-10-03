<!-- Generated from adapters/codex/package/skills/mhk-rules/references/migration.md; edit core/ or adapters/ and run npm run build:plugins. -->

# Verify and migrate existing Claude guidance

Use this only after migration was selected. Migration **validates the existing Claude inventory against current evidence**; it is not a copy, and it does not silently turn into a broad discovery scan for unrelated new conventions. (A later normal rerun, or an explicit fresh scan, handles new discoveries.) Use [repo-cartographer.md](repo-cartographer.md) for focused discovery and source checks.

All sources are **read-only**: `CLAUDE.md`, `.claude/rules/`, `.claude/settings.json`, and `.mhk/memory/`. Never modify them, whatever their ownership.

## 1. Complete inventory

Build a numbered inventory of every item before verifying anything. Include:

- every command, rule, signpost (the one-line pointers to `.claude/rules/` files), exemplar pointer, anti-exemplar, divergence-resolution comment, and Unconfirmed entry inside the `CLAUDE.md` rules block (`<!-- mhk:rules:begin -->` … `<!-- mhk:rules:end -->`, or an older `<!-- mhk:managed:begin -->` … `<!-- mhk:managed:end -->` or `<!-- BEGIN: ai-guide -->` … `<!-- END: ai-guide -->` pair). Do not migrate the Claude memory block or an older memory pointer inside the rules block: `$mhk-memory` sets up Codex's own memory block;
- every `.claude/rules/*.md` file, and within each: its `paths:` globs, each rule statement, and **every catalog row** individually;
- every relevant `permissions.deny` (and `allow`, where it qualifies a deny) entry in `.claude/settings.json` — read the actual settings, because prose in rule files may omit `Read` restrictions or misstate them.

**Which rule files count.** Ownership and inclusion are different questions:

- A `.claude/rules/` file carrying a recognized marker is mhk-generated. Recognized forms — the current marker and its legacy long form, only these; do not infer ownership from content or from comments merely mentioning mhk:
  - `<!-- mhk:generated -->`
  - `<!-- mhk:generated - managed by /mhk:rules; edits may be overwritten -->`
- A file **without** a marker that a managed signpost links to is still an **import candidate** — the rules block explicitly adopted it. Import it, and note that the source file is unmarked. Missing markers must not cause linked candidates to be skipped.
- A marked file that **no signpost links to** is still inventoried and verified; flag the missing connection in the summary.
- A signpost whose target file is missing is inventoried as an item and flagged.
- An unmarked, unlinked file is human guidance: read it as policy/context, do not import it as mhk content.

If a source resolves outside the target repository (a symlink or absolute link), stop at the boundary, report it, and mark the dependent items unresolved.

## 2. Verify each item

Assign **every** inventory item exactly one disposition. No item may be silently dropped.

| Disposition | Required evidence and action |
| --- | --- |
| Verified | Current code/configuration or explicit human policy supports it. Preserve its useful wording, scope, and position. |
| Correction proposed | Show the original claim, the current evidence, and the smallest justified correction. |
| Obsolete | Explain why it no longer applies, with evidence, and propose omission. |
| Unresolved | State the missing or conflicting evidence and ask only the question needed to resolve it. Do not guess. |

Verification checks, as applicable to the item:

- **Commands** — defined in current scripts/workspace config; correct working directory; per-package where the generator or tool is per-package (do not assume uniformity across modules).
- **Symbols and paths** — each named class, widget, helper, or file still exists at the stated location; export/import path is correct.
- **Reuse** — named public entry points remain useful, with representative live consumers supporting their description. Do not perform a usage census.
- **Generator and localization configuration** — the stated generators, output directories, output classes, locales, and regeneration commands match current config.
- **Exemplars** — the canonical path exists, still illustrates the stated aspect, is still registered/reached, and the recorded invisible-wiring steps are still the actual touchpoints. Keep an existing divergence-resolution comment unless materially changed evidence warrants reopening it.
- **`paths:` coverage** — each glob still matches the files it is meant to (consumers for catalogs and discipline rules; affected files for constraints), and matches nothing it should not.
- **Meaningful exceptions** — look for legitimate exceptions before carrying over an absolute.

Do not carry historical percentages forward as current facts. Prefer a supported scoped description, proposing removal of obsolete measurement text while preserving its useful meaning. Recount only if the number itself changes a consequential decision. Observed conventions remain preferences unless policy or a correctness reason supports a requirement.

**Policy versus prevalence.** A human-stated requirement is not invalidated by violating code; label the violations. Read relevant committed `.mhk/memory/` facts when they explain an exception or a settled decision, and qualify or flag conflicting items rather than copying behavior that memory says is obsolete. Never read native/personal memory stores.

## 3. Preserve content

Preserve verified filenames, table rows, row order, `paths:` metadata, scope, and wording wherever possible. Retained catalog entries stay in a useful table — **never summarize a verified catalog into a vague paragraph**.

Allowed changes to verified content are limited to:

- corrected facts (with the evidence shown);
- justified compression from the shared draft audit: account for each original item, explain the duplication or low value, and show where retained meaning and policy provenance live; do not silently omit verified guidance;
- `.claude/rules/<topic>.md` links becoming `.mhk/rules/<topic>.md`;
- signposts becoming detailed root index rows: the signpost's wording seeds the *what it covers* column; add a task trigger and a path predicate from the rules file's verified `paths:`, and link to `.mhk/rules/`. Claude's one-line brevity is intentional there (Claude auto-loads the file); Codex needs the fuller row;
- Codex-specific loading language (model-directed retrieval, never "loads automatically when a matching file is read");
- the ownership marker becoming the exact short form;
- removal or correction of Claude-only enforcement claims — e.g. "Edit-denied in `.claude/settings.json`" must not survive as a Codex enforcement promise; reword it as an instruction unless a validated Codex restriction exists (see [permissions.md](permissions.md)).

Explain every substantive omission **individually** in the migration summary, citing its inventory number. Claude-only references to other commands (`/mhk:memory`, `/mhk:rules-add`) are rewritten or dropped with a note.

## 4. Hard constraints

Pass every inventoried restriction to [permissions.md](permissions.md) as `operation | source pattern | intended effect`. Its instructional content (what not to edit, what to regenerate instead) is always kept in the rules output regardless of whether native enforcement is possible.

## 5. Existing Codex output

A normal rerun with owned Codex output uses the Codex inventory and does **not** re-import Claude changes. Import Claude again only when the user explicitly requests migration. In that case, compare each imported item against the current Codex output and show conflicts with Codex-specific decisions (edited wording, resolved divergences, rejected rules, native-permission choices); never overwrite them silently.

## 6. Migration summary

Apply the shared draft audit from the skill after rendering; migration remains limited to its selected inventory and necessary verification. Before the diffs, present a summary table covering every inventory item: `# | source (file:line or row) | item | disposition | evidence | destination`. List Unresolved items with their questions, flagged connection problems (unlinked marked files, missing signpost targets, unmarked-but-linked sources), and boundary findings. Approval of migration *mode* is not approval to write anything; the diffs are approved separately.
