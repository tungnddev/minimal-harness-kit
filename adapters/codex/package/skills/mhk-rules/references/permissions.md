# Native Codex permission proposals

Treat knowledge and enforcement separately. Inputs may be Claude `.claude/settings.json` `Read(...)`/`Edit(...)` restrictions, existing Codex configuration, or verified repository hazards. Show a separate restriction report: `operation | source pattern | intended effect | candidate native effect | limitations | validation result`.

Use current official Codex permissions/configuration documentation and local `codex --version` before emitting TOML. Permission profiles are beta. Check the platform and the effective configuration layers; project configuration is trust-gated. A `sandbox_mode` in any loaded layer, or a `--sandbox` override, can select legacy sandboxing instead of `default_permissions`. Never claim a proposed profile is active in that state. Do not edit user-global, managed, or unrelated settings. Do not mix profile and legacy sandbox keys in the generated config.

Prefer a dedicated project-local `mhk` named profile in `.codex/config.toml`, starting from the effective workspace profile when available. Preserve any existing user-defined policy, network setting, approval behavior, and writable roots. If an unowned profile named `mhk` already exists, or a compatible baseline cannot be determined, report the conflict and leave that part unchanged. Propose `default_permissions = "mhk"` only when the resulting effective behavior has been checked and no incompatible legacy setting takes precedence. Keep a small in-band ownership comment beside every mhk-created config key or table; preserve every unowned key and comment. Parse the final TOML before proposing it.

Translation rules:

| Source intent | Candidate | Required caveat |
| --- | --- | --- |
| Block both reads and writes | Native `deny` on a supported path, subtree, or deny-read glob | Glob and platform behavior must be validated |
| Allow reads but block writes on exact path/subtree | Native `read` | May block legitimate generators, tools, or tests |
| Block manual edits to a scattered generated-file glob, while allowing codegen | No automatic equivalent | Keep instruction and report enforcement gap |
| Read-only restriction | Do not convert to `read`; consider `deny` only if blocking writes too is acceptable | `read` means *allow reading* |

Native filesystem `deny` blocks both reads and writes. It can affect subprocesses such as code generators. A Claude tool-specific `Edit` restriction is therefore not automatically a native filesystem rule. A readable-but-unwritable glob may also be platform-dependent. Avoid wildcard deny proposals when their match expansion cannot be verified. Other surfaces, including connectors and approved escalation, have their own controls.

When proposing enforcement, test the exact profile against disposable fixture paths using the installed Codex sandbox helper, including a prohibited operation and a legitimate operation such as generation when relevant. Never probe by writing to actual protected project files. If the fixture cannot establish a safe match, mark the restriction unsupported or unverified and omit that config key. A user may approve rule documents without approving config changes. The final report must state whether each restriction is enforced, advisory, unsupported, or inactive due to configuration precedence.
