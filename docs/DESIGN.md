# Design principles

Why `mhk` is built the way it is. The [README](../README.md) covers *what* it does; this covers *why* every choice was made.

## Two independent layers

`mhk` splits repository knowledge into two independent layers. The full rules workflow and its `rules-add` fast path manage rules; the memory workflow and its approved capture offer manage memory. See [RULES_AND_MEMORY.md](RULES_AND_MEMORY.md) for the complete lifecycle.

- **Rules — the *derived* layer.** Selected guidance supported by a read-only scan and current project policy: real commands, project-specific constraints and preferences, shared surfaces worth reusing, sound exemplars, and protected files. Confirmed policy survives incomplete code adoption. Owned by **`/mhk:rules`** on Claude and **`$mhk-rules`** on Codex.
- **Memory — the *accumulated* layer.** The knowledge a scan **can't** show: invariants, war-stories, business rules — the *why*. It surfaces during normal work, so it is captured there: at the end of a task, the agent offers to share a fact it just learned. Shared facts live in a committed `.mhk/memory/` store, so every checkout and teammate inherits them instead of one machine's local memory keeping them. Owned by **`/mhk:memory`** on Claude and **`$mhk-memory`** on Codex.

Each layer works without the other and owns its own marked block in `CLAUDE.md` or `AGENTS.md`: `<!-- mhk:rules:begin/end -->`, then `<!-- mhk:memory:begin/end -->`. A command writes only its own block and reads the others as context, so a new component adds a block instead of growing another command's output. Claude's memory block imports the index with `@.mhk/memory/MEMORY.md`, so it loads into every session the way native `MEMORY.md` does; Codex has no imports, so its memory block points to the index. The rules workflows never modify the memory store; Codex's may read committed facts as allowed evidence.

## The principles

- **Shared source, concrete installed instructions.** Discovery methodology and playbooks live in `core/`. Build-time templates substitute names and insert complete adapter paragraphs for loading and permissions. Each installed package contains resolved instructions for its own platform, with no runtime term map. The scanner reports facts and applicability; workflows choose output paths and native behavior. Generated plugin packages are committed and checked against source in CI. See [ARCHITECTURE.md](ARCHITECTURE.md).

- **Idempotent convergence.** The rules workflow proposes the harness on a fresh repo and justified corrections or consolidations on a tuned one. An unchanged, already-audited harness produces no diff. There is nothing to initialize and no version to track; the first run is onboarding.

- **In-band ownership, no state file.** mhk manages only what it can prove it created: its marked blocks in `CLAUDE.md` or `AGENTS.md` — one per layer — and rules files carrying an `<!-- mhk:generated -->` marker. The rules block's older markers (`<!-- mhk:managed:begin/end -->`, `<!-- BEGIN/END: ai-guide -->`) and the long `<!-- mhk:generated - managed by … -->` trailer are still recognized as owned, and are upgraded only by the full rules workflow through an approved diff; `rules-add` preserves legacy markers. Human content outside managed blocks and unmarked rule files is preserved. The dedicated `.mhk/memory/` store is maintained by the memory workflow, including approved corrections and removals. Claude `permissions.deny` entries are only ever appended. Ownership travels *with* the file, so nothing can fall out of sync the way a side manifest would.

- **Overview-first discovery.** Start with policy, configuration, shared entry points, and representative modules. Expand only for consequential uncertainty. Keep project-specific rules and reusable surfaces; omit generic advice. A sampled pattern supports a scoped preference, not a universal prohibition. Explicit policy survives low adoption.

- **Explicit invocation only.** Every command runs when typed — never model-auto-triggered. The host enforces it: Claude commands set `disable-model-invocation: true` and Codex skills set `allow_implicit_invocation: false`. This is the biggest lever against hallucinated mid-task regenerations. The one deliberate exception is the memory capture offer, switched on by running the memory command: at the end of a task the agent may *ask* to share a fact it learned, and it writes only memory, only after an explicit yes, and never commits.

- **Approval-gated writes.** Every writing workflow proposes a diff and waits for approval; doctor is read-only. A capture offer quotes the exact fact before saving. Native permission proposals receive separate approval because they affect enforced behavior.

- **Diagnose setup separately from content.** Both doctors provide a fast, read-only health report and route each issue to its owning workflow or a manual action. They inspect owned content, check references by existence, and report sharing gaps. Optional layers and age alone are informational. They never run tests, repair files, or decide whether guidance is true; a clean doctor report does not replace rules or memory verification.

- **Brief review of the complete draft.** Read root and topics together for supported wording, working pointers, important exceptions, obvious contradictions, and duplication. Check that ordinary tasks and new files can find relevant guidance. Keep implementation audits outside generation.

- **Keep discovery and output compact.** Prefer short search results, targeted reads, one report per finding, and pointers to live code. Routine usage counts, confidence scores, decision tables, and task-size reports are unnecessary. Measure context separately when evaluating the plugin; splitting files only helps when retrieval boundaries differ.

- **One home for detail.** Retain short root guardrails and topic pointers. Keep supporting observations temporary, while policy provenance, consequential exceptions, and settled choices remain with the relevant guidance. Omit empty sections and leave implementation details in source.

- **Stable audited reruns.** Preserve verified content by default. A concrete audit defect can justify an approved consolidation even when code has not changed: account for the original items, explain the reason, and show where retained meaning lives. Once fixed, unchanged evidence and no concrete defect mean no diff. Human content and settled policies are preserved.

- **Least privilege.** Claude's `repo-cartographer` is restricted to Read/Grep/Glob and configured with `omitClaudeMd: true`; its discovery instructions exclude memory stores. Codex discovery is read-only by instruction, without the same tool-enforced isolation. Claude's doctor runs with Write, Edit, and NotebookEdit removed (`disallowed-tools`); Codex's doctor is read-only by instruction. `/mhk:memory` is read-only on native memory, `$mhk-memory` reads no personal memory at all, and both scrub anything sensitive before it can reach a committed path.

- **Capture the reuse surface, not just constraints.** A repo's shared widgets/hooks/helpers/base classes are captured as a compact `name | purpose | where` lookup (never code skeletons), so the LLM reuses them instead of reinventing them.

- **Point to every scoped rule from the root block — as briefly as the platform allows.** On Claude, a path-scoped `.claude/rules/` file loads only when a matching file is read — absent during planning and file creation — so each scoped file gets a one-line signpost in the always-loaded `CLAUDE.md`, and nothing more: Claude loads the detail itself. On Codex, `.mhk/rules/` files are never loaded automatically, so each gets a detailed index row in `AGENTS.md` (task trigger, paths, what it covers, link) — the row is the only route to the file.

- **Exemplars point to representative live code.** State the aspect to mirror and essential external wiring. Layout pointers do not endorse every implementation detail. Retain known consequential caveats and settled choices; do not select by version-name suffix or require a broad application audit.

- **Keep native memory's shape, not its bytes.** Fact files keep Claude's native auto-memory shape with no mhk-specific fields, so sharing a note is a plain copy and a change to that format shows up as a new or missing key instead of being silently absorbed. Per-machine stamps (`originSessionId`, `modified`) travel with a fact but never count as a change, and a missing native copy is never evidence against a fact — every other machine normally has none. The committed index is derived from the fact files, and regenerated on maintenance runs to repair drift or index merge conflicts. Conflicts in the facts themselves still require review.
