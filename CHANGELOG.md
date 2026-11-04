# Changelog

Each release raises the plugin version. Claude Code and Codex download a new copy only when it changes; see [updating](docs/INSTALL.md#updating).

## 0.3.0 — 2026-11-04

After updating, run `/mhk:migrate` (Claude Code) or `$mhk-migrate` (Codex) once in each repository that has mhk files. The other writing commands stop and point to it until then.

- New migrate workflow, `/mhk:migrate` and `$mhk-migrate`. It brings existing mhk files to the installed version by applying the migration notes released since, with no code scan, and records the version in `.mhk/version.json` (one entry per platform).
- The 0.3.0 rules note converts older markers and the older memory pointer, removes lines that say a kind of command doesn't exist (`test: none`, "No test project"), and flags kept rules that lost an exception from their source.
- Rules generation lists only commands the project has.
- The writing commands check `.mhk/version.json` first. Old-marker handling moved out of them into the migration note.
- `/mhk:rules migrate|fresh` and `$mhk-rules migrate|fresh` are removed. When only the other platform has rules, the rules workflow still asks, now as **Import and verify** or **Fresh scan**.
- Doctor reports a Version section first: files from before version tracking, pending notes, and an entry newer than the installed mhk.

## 0.2.0 — 2026-11-03

- Core sources are grouped into one folder per layer (`core/shared`, `core/rules`, `core/memory`, `core/doctor`). The Claude package ships the rules playbooks under `playbooks/rules/`.
- Codex discovery finds playbooks by folder, so a new platform is one new playbook file on both agents.
- The plugin version is written only in the root `package.json`; the build copies it into both plugin manifests.
- README rewritten around the core idea, with a real example. The project is now MIT licensed.
- Install docs: fixed the per-repo `enabledPlugins` example and added update steps.

## 0.1.0

- First release: rules, one-rule additions, shared team memory and a read-only doctor, for Claude Code and Codex.
