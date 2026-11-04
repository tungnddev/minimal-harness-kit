# Manual rules, memory and migrate evaluation

This is a regression and acceptance checklist for the implemented Claude Code and Codex plugins, not a record of individual test results. Run it when changing workflows, packaging, or host integration, against disposable consumer repositories using the installed plugin rather than loading source skills directly.

## Baseline

Record the host/version, plugin revision, installation method, fixture repository, initial guidance, and actual results. Keep transcripts, diffs, and observations with the evaluation report rather than adding them to permanent rules or memory.

In the plugin source repository, run:

```sh
npm test
npm run check:plugins
```

These validate package assembly and references only. In each consumer fixture, include human text in the root file and an unmarked topic file to check preservation. Use a repository with a real command, a scoped convention, a shared helper, and a representative source example.

## Rules cases — run on both platforms

| Case | Expected observation |
| --- | --- |
| Fresh setup | Read-only discovery followed by complete proposed root/topic changes; no writes before approval |
| Apply approved guidance | Files match the proposal; human text and unmarked topics survive; links resolve |
| Stable rerun | Unchanged evidence and no audit defect produce no diff |
| Changed source | A moved helper or changed command produces a supported correction without dropping unrelated policy |
| One-rule addition | Targeted verification and exact wording/placement review; no full scan or native-setting changes |
| Duplicate addition | Existing rule is identified and no file changes |
| Import in each direction | With only the other platform's rules present, **Import and verify** is offered; source guidance is verified, source files remain unchanged, destination retrieval is translated |
| Existing destination | Ordinary rerun does not silently import later source-platform changes |
| Partial approval | Applied subset has no dangling topic links or rejected rules |
| Native restrictions | Separate review; enforcement is claimed only when actually validated |
| Commands | No `test: none`, "No test project" or similar line for a kind of command the project lacks |
| First files | A repository with no mhk files gets this platform's `.mhk/version.json` entry in the same diff |

In a new session, try a task that reads an existing scoped file, a planning task, and a task creating a new file. Observe which guidance the agent actually reads and uses. For Codex, confirm documents are opened through index instructions rather than assuming `paths:` triggers loading. Repeat with a root `AGENTS.override.md` and confirm the loading limitation is reported.

## Memory cases — run on both platforms

| Case | Expected observation |
| --- | --- |
| Memory-only setup | Exact memory block and empty index are proposed without requiring rules |
| Rules-first setup | Memory block is added after rules; rules content is preserved |
| Second platform setup | Its root memory block reuses the same store without resetting existing facts |
| Approved capture | After the task and user review, a quoted durable fact is offered; approval writes the fact and ordered index entry |
| Rejected capture | No write, and no repeated offer for that fact |
| Fresh-session recall | Agent reads and applies the relevant shared fact; unrelated details stay in their fact files |
| Stable maintenance | Current facts and index produce no diff |
| Broken index | Hand edits or index merge markers are replaced by a proposed index derived from facts |
| Missing native copy | A teammate's fact is retained; absence on this machine is not treated as staleness |
| Stale or conflicting fact | Evidence and proposed correction/removal go to review; no silent overwrite |
| Rules duplication | Agent offers the appropriate rules workflow rather than editing rules during memory maintenance |

For Claude, also check the native-memory sweep: an eligible unshared fact is proposed, an already-shared fact is unchanged, volatile-only differences produce no update, and native memory remains untouched. Use synthetic personal/sensitive examples to confirm they are excluded without printing real sensitive data. For Codex, confirm memory setup, capture, and maintenance work without access to native personal memory.

Check that full memory maintenance writes only its root block and the memory store, and that capture never deletes facts. Check malformed and duplicate block markers are reported before writing. No case should create a commit.

## Migrate cases — run on both platforms

Use a repository whose mhk files came from 0.2.0 or earlier and that has no `.mhk/version.json`, such as one with a `test: none` line, an older marker, or an older memory pointer.

| Case | Expected observation |
| --- | --- |
| Writers before migrating | `/mhk:rules`, `/mhk:rules-add` and `/mhk:memory` stop and point to the migrate workflow before scanning or drafting |
| First migration | No scan or subagent; one diff per file, each change labelled with its note; absent-kind lines removed, a combined line keeps its run policy; older markers converted; the entry is created with the installed version |
| Older memory pointer | Removed from the rules block; a memory block is added after it when none exists |
| Lost exception | A kept prohibition whose source has an exception is flagged with both lines; nothing changes without an answer |
| Text outside mhk blocks | Matching human text is reported, never edited |
| Partial approval | Rejected changes are not written and are not proposed again; the entry still moves |
| Second run | "Up to date" and no diff |
| No pending note, older entry | The only proposed change is the entry |
| Newer entry | Set the entry above the installed version: migrate and every writer refuse to write |
| Other platform | Its files and entry are untouched; the report points to that platform's migrate workflow |

## Doctor cases — run on both platforms

| Case | Expected observation |
| --- | --- |
| Empty repository | Both layers reported as not set up, with no warnings or errors |
| Current setup | **Everything looks current.** after the per-layer overview |
| Broken routing | A routed topic deleted, and an owned topic left unrouted, are reported with the platform's severity |
| Dead scope or pointer | A `paths:` glob matching no files, a removed exemplar path, and an undefined `npm run` script are each flagged |
| Index drift | Hand-edited or conflict-marked index is flagged and routed to the memory workflow |
| Unsafe fact | A synthetic email address in a fact is flagged by file and kind, without printing it |
| Untracked or ignored output | Warning with commit or ignore-rule guidance; tracked edits are informational |
| Age and unshared native facts | Old rule history and Claude native facts without a shared copy are informational, not warnings |
| Report contract | Version, Rules, Memory, Sharing, then the other platform when present; findings use the defined marks and end with counts and ordered next actions, a pending migration first |
| Version | No entry with mhk files, a pending note, and an entry newer than the installed mhk are warnings; invalid JSON is an error; an older entry with nothing pending is informational |
| Fact conflict | Conflict markers in a fact are an error requiring a human merge; index conflicts route to memory regeneration |
| Other platform present | Detection points to that platform's doctor; an import is suggested only when the current platform has no rules block; the other platform's rules and entry are not checked |
| Codex override | A root `AGENTS.override.md` is reported as preventing both blocks from loading |
| Invocation and writes | Doctor runs only when typed; no builds, tests, installs, deep scans, diffs, or fix offers; repository and native memory remain unchanged |

## Record the result

For each case, report pass, fail, blocked, or not run, with the observed behavior and a short evidence pointer. Separate package-check results from installed-agent results. Record retrieval gaps, host limitations, and any behavior that required manual prompting; do not count the existence of an instruction as proof that it ran.
