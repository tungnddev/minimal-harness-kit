Shape-and-length example for the AGENTS.md rules block — illustrative content only, do not copy into a real project. Omit sections that add no useful guidance. Template explanations below the block are generation instructions, not output.

<!-- mhk:rules:begin -->
# services/api

Go/Gin microservice owning auth, users, and billing.

## Commands
- install: `go mod download` (repo root)
- test: `go test ./...` (repo root)
- lint: `golangci-lint run` (repo root)
- build: `go build ./cmd/api` (repo root)

## Project-specific rules
- IDs are ULIDs stored as `bytea(16)`; use `internal/ids/`.
- Write to `users` through `internal/users/repo.go`. Project policy: CONTRIBUTING.md §3.

### Detailed rules and catalogs
These documents are not loaded automatically. During planning and before creating or editing files, read the rows relevant to the task or affected paths. Paths are relative to the repository.

| When working on | What it covers | Read |
| --- | --- | --- |
| HTTP handlers or middleware, including new endpoints (`internal/http/**`) | shared helpers and endpoint exemplar | [http-catalog](.mhk/rules/http-catalog.md) |
| Database migrations (`**/migrations/**`) | applied files are immutable; migration workflow | [migrations](.mhk/rules/migrations.md) |
<!-- mhk:rules:end -->

Keep essential cross-cutting guardrails and common verified commands in the root; put layer-specific details, specialized procedures, and exemplars with their relevant topic. A pointer must make that topic discoverable during planning and new-file creation. Combine a consequential guardrail with its pointer where possible. Do not repeat full rules in the routing section.

An exemplar topic can say `New endpoint: mirror internal/users/; register its route in internal/router/routes.go`. Recommend it only after checking live usage, suitability, and invisible wiring. Retain any settled divergence as a brief in-band comment beside that guidance; keep confirmed legacy anti-exemplars relevant to the same task. Do not copy implementation shapes into instructions.

Omit routine counts and confidence tags. Retain concise policy provenance and confirmed decisions needed on reruns. Do not create an Unconfirmed section for weak observations. A consequential unresolved decision needs a concrete question in its relevant topic (or the root only if genuinely cross-cutting).

Keep the root brief without a fixed line target. Check the complete draft for repeated meaning and useful topic routing; preserve confirmed requirements and exceptions.
Also report if selected instruction files approach the host's `project_doc_max_bytes` ceiling; that ceiling is a limit, not the content budget.
