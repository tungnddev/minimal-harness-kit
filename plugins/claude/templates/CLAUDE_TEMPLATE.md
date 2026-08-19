Shape-and-length example for the CLAUDE.md managed block — illustrative content only, do not copy into a real project.

<!-- BEGIN: ai-guide -->
# services/api

Go/Gin microservice. Owns auth, user, and billing endpoints. Talks to Postgres directly; nothing else does.

## Commands
- install: `go mod download`
- test: `go test ./...`
- lint: `golangci-lint run`
- build: `go build ./cmd/api`

## Project-specific rules
- IDs are ULIDs stored as `bytea(16)`, not UUID strings — see `internal/ids/`. [confidence: high — internal/ids/ulid.go + 40+ call sites]
- Writes to the `users` table must go through `internal/users/repo.go`; do not query it directly elsewhere, including from other handlers. [confidence: high — enforced by a lint rule in .golangci.yml]
- Migrations are one-way; `down` migrations are not maintained here.

### Reuse before building new
- HTTP handlers: reuse the shared middleware/response helpers — see .claude/rules/http-catalog.md
<!-- one-line signpost per scoped rules file; the catalog/detail lives in the scoped file, which loads only when a matching file is read (so this pointer is what keeps it visible during planning and file creation) -->

### Exemplars — mirror these when adding code
- New endpoint: mirror `internal/users/` — then register the route in `internal/router/routes.go`
<!-- one-line 'mirror <path>' pointer per repeated multi-file archetype, plus the single wiring step not visible in the exemplar file. The copyable shape lives in the referenced file (read on demand), never restated here. Only for multi-file composites — single-file/regular concepts (a Model, a VM) stay rules, not exemplars. -->
<!-- If /mhk:rules resolved a competing-shape divergence, it records that here in-band (a one-line "divergence resolved <date>: <which shape won and why>" comment) so a later run doesn't re-ask. A shape confirmed as legacy becomes an anti-exemplar line instead of a mirror pointer, e.g.:
     - Do NOT imitate `internal/legacy_users/` — superseded shape, kept only for the v1 API. -->

### Project memory
<!-- Static pointer, owned by /mhk:rules (part of the derived block). The promoted memory index and the fact bodies both live under .mhk/memory/ and are owned entirely by /mhk:memory — so this line stays byte-stable as memory grows and CLAUDE.md never churns on a promotion. -->
- Durable promoted facts (the *why* a scan can't show — invariants, war-stories, business rules) are indexed in `.mhk/memory/MEMORY.md`, a committed mirror of Claude's native `MEMORY.md`. Consult it when starting non-trivial work, and open a linked file when its relevance hook matches.
<!-- When you write a native auto-memory during a session, remind the user it can be promoted via /mhk:memory. Soft nudge only — /mhk:memory is idempotent, so a missed reminder is picked up next run. -->

### Unconfirmed — verify before relying on
- Handler files seem to follow `handler_<resource>.go` naming, but 3 of 14 don't; confirm before treating as a rule. [confidence: medium]
<!-- END: ai-guide -->

Budget: keep the managed block under ~80 lines. If it's growing past that, it's a sign some rules are marginal — cut the weakest-evidence ones rather than let it grow unbounded.
