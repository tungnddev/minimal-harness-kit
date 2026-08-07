# Playbook: Backend

Applies when the repo's `kind: backend` or `microservice`, any language.

Categories to investigate — not rules to copy in. Record a candidate only if it clears the delta bar in `repo-cartographer.md` §2. A category with nothing distinctive going on contributes no rule at all — that's expected, not a gap.

- **Architecture style** — hexagonal/DDD (`domain/`, `application/`, `infrastructure/`, `ports/`, `adapters/`), layered MVC (`controllers/`, `services/`, `models/`), or transaction-script/no layering. Infer from folder names, then confirm the layering is actually followed (does a "controller" contain business logic that should be in a service/domain layer?).
- **Dependency direction** — if a domain/core layer exists, does it actually stay free of framework imports, or is that aspirational? Worth recording as a rule only if it's genuinely enforced today.
- **Persistence / repository abstraction** — are database queries centralized behind a repository pattern, or scattered inline across handlers? If centralized, what's the naming convention for repository methods (business-intent names vs generic CRUD)?
- **Error/exception hierarchy** — domain-specific exception types vs generic exceptions/errors bubbling straight to the API layer.
- **API contract conventions** — response envelope shape, pagination convention, versioning scheme — only worth recording if consistent and non-default.
- **Validation placement** — where input validation actually happens (DTO/request layer, use-case layer, domain object constructors) — and whether it's consistent.
- **Inter-service communication rule** — sync REST vs async events/queue, and which is required where (e.g. "service A never calls service B directly, only via the gateway/event bus"). This is usually the highest-value cross-cutting contract in a microservice repo — check for it explicitly.
- **Migration conventions** — one-way only? naming pattern? any tooling-specific gotcha (e.g. no `down()` maintained).
- **Testing boundary** — what's mocked vs run for real in unit vs integration tests, and where that line is actually drawn in this codebase.
- **Reuse surface / shared API catalog** (→ scoped catalog rule + CLAUDE.md signpost, per `repo-cartographer.md` §3) — the shared middleware, base handler/controller/service classes, client wrappers for external services, and common response/error/validation builders an LLM would otherwise reinvent. Capture the ones actually reused across handlers/services as a `name | purpose | where` lookup (names and locations, not code bodies). If the repo has more than one shared surface (e.g. HTTP middleware/response helpers vs. domain/application base classes), emit one catalog per package/consumption boundary — each scoped to where that surface is used — not a single merged file. This is reference, not a constraint. Separately, where the codebase *enforces* going through one of these (every response built via the shared envelope builder, every query through a repository, every external call via the client wrapper), measure that preferred-vs-raw ratio per axis independently and emit it as a discipline rule (section 2), per the reuse-discipline note in `repo-cartographer.md` §3 — that's a constraint, distinct from the reference catalog.

Explicitly out of scope: generic language idioms, generic "validate your input" / "write tests" advice not tied to a specific mechanism this codebase actually uses.
