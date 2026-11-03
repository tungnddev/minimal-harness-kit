# Changelog

Each release raises the plugin version. Claude Code and Codex download a new copy only when it changes; see [updating](docs/INSTALL.md#updating).

## 0.2.0 — 2026-11-03

- Core sources are grouped into one folder per layer (`core/shared`, `core/rules`, `core/memory`, `core/doctor`). The Claude package ships the rules playbooks under `playbooks/rules/`.
- Codex discovery finds playbooks by folder, so a new platform is one new playbook file on both agents.
- The plugin version is written only in the root `package.json`; the build copies it into both plugin manifests.
- README rewritten around the core idea, with a real example. The project is now MIT licensed.
- Install docs: fixed the per-repo `enabledPlugins` example and added update steps.

## 0.1.0

- First release: rules, one-rule additions, shared team memory and a read-only doctor, for Claude Code and Codex.
