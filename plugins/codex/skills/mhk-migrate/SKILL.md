---
name: mhk-migrate
description: Bring a repository's Codex mhk files up to the installed mhk version after an update, by applying the released migration notes without a code scan. Use only when explicitly invoked.
---

<!-- Generated from adapters/codex/package/skills/mhk-migrate/SKILL.md.tmpl; edit core/ or adapters/ and run npm run build:plugins. -->

# mhk migrate for Codex

Upgrade one repository's Codex mhk files — the `AGENTS.md` rules and memory blocks and the owned `.mhk/rules/*.md` files — to the installed mhk, 0.3.0. Use the path given with the invocation, otherwise the current Git repository. Run it after updating mhk, or when another mhk skill or `$mhk-doctor` asks for it. Operate only on explicit invocation.

- **Notes:** `references/migrations/<layer>/<version>.md` in this skill, one file per release that changed a layer's files.
- **Memory block template:** [MEMORY_BLOCK.md](../mhk-memory/assets/MEMORY_BLOCK.md), for notes that write the memory block.
- **Claude files** (`CLAUDE.md`, `.claude/`) and the `claude` entry are out of scope. If they exist, end the report with one line: run `/mhk:migrate` in Claude Code.
- **Overrides.** A root `AGENTS.override.md` replaces `AGENTS.md`: report that the migrated blocks will not load while it does. Never edit overrides.

## What this command does

It brings this platform's existing mhk files up to the format of the installed mhk, 0.3.0, by applying the migration notes released since they were last migrated. Then it records 0.3.0 in `.mhk/version.json`. It is the fast path after updating mhk:

- It never scans the code, never invokes a discovery subagent, and never runs builds, tests, installs or generators. A note that needs new evidence names the command to rerun instead.
- It changes only mhk-owned text: the mhk blocks in `AGENTS.md` and the owned topics in `.mhk/rules/`. Unlike the other workflows, it may edit every mhk block of this platform, but only as a note directs. Text outside mhk-owned files is reported, never edited.
- It never sets up a layer that isn't there: `$mhk-rules` and `$mhk-memory` do that, and the doctor lists layers that are not set up. Converting an older form of a layer that is there is a migration, not a setup.
- It changes only this platform's files and this platform's entry in `.mhk/version.json`.

### mhk blocks in `AGENTS.md`

mhk writes to `AGENTS.md` only inside its own marked blocks, and each block belongs to exactly one workflow:

| Block | Markers | Owner |
| --- | --- | --- |
| Rules | `<!-- mhk:rules:begin -->` … `<!-- mhk:rules:end -->` | `$mhk-rules` |
| Memory | `<!-- mhk:memory:begin -->` … `<!-- mhk:memory:end -->` | `$mhk-memory` |

- Write only your own block. Read the other mhk blocks as context, so you neither duplicate nor contradict them; never edit, reorder, or adopt their content.
- Everything outside mhk blocks is human-authored: preserve it, and read it as policy/context.
- Blocks keep this order: rules, then memory. Place a missing block after any mhk block that comes before it in this order, otherwise at the end of the file. Create `AGENTS.md` if it does not exist.
- Validate your block's markers before writing. A duplicate, mixed, or unmatched pair is a conflict: stop and ask.
- Older markers still mark mhk files: `<!-- mhk:managed:begin -->` … `<!-- mhk:managed:end -->` and `<!-- BEGIN: ai-guide -->` … `<!-- END: ai-guide -->` for the rules block, and the trailer `<!-- mhk:generated - managed by /mhk:rules; edits may be overwritten -->` on topic files. Read them as owned; only `$mhk-migrate` converts them, and every workflow writes only the current forms.

### Version file: `.mhk/version.json`

`.mhk/version.json` records, per platform, the mhk version that platform's mhk files were last migrated to. It is committed with them, and holds versions only:

```json
{ "claude": "0.3.0", "codex": "0.3.0" }
```

- This platform's key is `codex`, and the installed mhk is 0.3.0. Read and write only this key; keep the other platform's entry unchanged.
- This platform's mhk files are the mhk blocks in `AGENTS.md` and the owned topics in `.mhk/rules/`, in their current or older markers. The shared `.mhk/memory/` store does not count.
- Migration notes ship for these layers. A note is pending when this platform has no entry, or when the note's version is newer than the entry.

| Layer | Migration notes |
| --- | --- |
| rules | 0.3.0 |
| memory | none |

## 1. Inventory

Read `AGENTS.md`, the owned topics in `.mhk/rules/`, and `.mhk/version.json`. Find each layer's files by their markers, current or older. Stop and ask the user to fix it by hand when a marker pair is duplicated, mixed or unmatched, when `.mhk/version.json` isn't valid JSON, or when this platform's entry isn't a version.

## 2. Pick the notes

- This platform has no mhk files: there is nothing to migrate. Say which command sets up each layer, and write nothing.
- The entry is newer than 0.3.0: stop. A newer mhk wrote these files; update mhk first.
- Otherwise, for each layer that has files, take its pending notes, oldest first. With no entry, every note is pending. Notes describe the older shape, so files already in the current shape match nothing.
- Nothing pending and the entry is 0.3.0: report that the files are up to date, and write nothing.
- Nothing pending and the entry is older: the only change is the entry.

## 3. Draft

Read each picked note. Each item has one kind:

| Kind | Action |
| --- | --- |
| `edit` | Change text inside mhk-owned files. |
| `restructure` | Rename, move or split mhk-owned files or markers, keeping their content. |
| `remove` | Delete an mhk-owned file or section that mhk no longer uses. |
| `flag` | Needs a person: show the evidence and ask; change nothing. |
| `rerun` | Needs new evidence from the code: name the command to run and why; change nothing. |

Apply the items in version order to a draft kept outside the repository. Where two items touch the same text, the later note wins. Apply an item only where its Find matches, and leave everything else exactly as it is, including lines people added inside the blocks. Make a targeted read only where an item asks for one.

## 4. Review

Before writing anything, present:

1. one complete diff per affected file, each change labelled with its note version and item title;
2. each flag, with the lines involved and its question;
3. each rerun, with the command and the reason;
4. text outside mhk-owned files that an item matched, as a report only;
5. the entry change, such as `"codex": "0.2.0"` → `"codex": "0.3.0"`, or the new file.

Allow approval or rejection per file. A rejected change and an unanswered flag both count as reviewed: the entry still moves, so they are not raised again. Rejecting the whole migration writes nothing, the entry included.

## 5. Write and read back

Write only the approved files. Then set this platform's entry to 0.3.0, keeping the other platform's entry, and create `.mhk/version.json` if it is missing. Read each file back against the approved content, and check that every block's markers are single, current and well-formed, and that every owned topic ends with the exact `<!-- mhk:generated -->`. Report mismatches instead of silently changing approved content. Never commit.
