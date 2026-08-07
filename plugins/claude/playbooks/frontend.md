# Playbook: Frontend / Web

Applies when the repo's `kind: frontend`, any framework (React, Vue, Angular, Next.js, etc.).

Categories to investigate — not rules to copy in. Record a candidate only if it clears the delta bar in `repo-cartographer.md` §2. A category with nothing distinctive going on contributes no rule at all — that's expected, not a gap.

- **Component organization** — atomic-design folders, feature-folder colocation, or colocated tests/styles per component. Check consistency, not just the presence of a `components/` folder.
- **State management** — which library (Redux/Zustand/Jotai/Context/server components) and how it's wired at the app root.
- **Styling approach + design tokens (measure each axis separately)** — CSS modules/Tailwind/styled-components, and whether a central design-token/theme file is actually followed. Typography tokens, color tokens, and spacing are independent axes with often-opposite adherence, so probe each as its own ratio rather than one lumped verdict: grep each preferred-token usage against its raw equivalent (inline hex colors, ad-hoc spacing values, hardcoded font sizes). Emit a discipline rule only for the axes clearing the >70% bar (per the reuse-discipline note in `repo-cartographer.md` §3); a followed axis must not be suppressed by a sibling axis that fails.
- **Data fetching & caching** — React Query/SWR/custom hooks, and any non-default caching/invalidation convention.
- **Routing convention** — file-based vs config-based, and whether it contradicts the framework's current default (e.g. Next.js still on Pages Router) — this is usually a high-value "contradicts ecosystem default" candidate.
- **i18n mechanism** — which library, and the exact key-usage convention actually followed.
- **Codegen dependencies** — generated API clients or GraphQL codegen output, and the "must regenerate after changing the schema" gotcha.
- **Testing conventions** — what's actually tested (unit vs component vs e2e) and with what tooling, if consistent.
- **Reuse surface / shared API catalog** (→ scoped catalog rule + CLAUDE.md signpost, per `repo-cartographer.md` §3) — the shared components, custom hooks, context providers, and util modules an LLM would otherwise reinvent: e.g. the design-system component library, data-fetching hooks, formatting/validation utils, the shared API client. Capture the ones actually reused across features as a `name | purpose | where` lookup (names and locations, not code bodies). If the repo has more than one shared surface (e.g. a design-system component library and a separate shared-hooks/utils package), emit one catalog per package/consumption boundary — each scoped to where that surface is used — not a single merged file. This is reference, not a constraint.

Explicitly out of scope: generic JS/TS style, generic "make components reusable" advice not tied to a specific convention this codebase enforces.
