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

### Unconfirmed — verify before relying on
- Handler files seem to follow `handler_<resource>.go` naming, but 3 of 14 don't; confirm before treating as a rule. [confidence: medium]
<!-- END: ai-guide -->

Budget: keep the managed block under ~80 lines. If it's growing past that, it's a sign some rules are marginal — cut the weakest-evidence ones rather than let it grow unbounded.
