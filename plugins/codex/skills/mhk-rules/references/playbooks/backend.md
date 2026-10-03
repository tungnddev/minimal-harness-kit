<!-- Generated from core/playbooks/backend.md; edit core/ or adapters/ and run npm run build:plugins. -->

# Backend discovery prompts

Use relevant prompts for services and backend libraries. Follow the shared cartographer's selection rules; skip categories that add no project-specific guidance.

- **Structure:** entry points, service boundaries, layers, route/handler registration, and background workers.
- **Access:** where authentication, authorization, and tenant/owner data scoping (which records a caller may read or change) are enforced, and what a new entry point or query must do to inherit them.
- **Data:** data-access entry points, transaction boundaries, non-obvious schema or query conventions, and migration workflow.
- **Contracts:** response envelopes, errors, pagination, versioning, validation placement, and differences between API audiences (public, partner, internal, admin).
- **Integrations:** internal and partner clients, queues and events, whether services may call each other directly or only through a gateway or messaging, retry/idempotency conventions, and required configuration/wiring.
- **Codegen:** schema or spec sources (API specs, protocol definitions, database schema), generated code, regeneration command/cwd, and outputs to avoid editing.
- **Reuse:** public helpers, middleware, base classes, and clients used across features. Describe behavior from source rather than names, especially auth helpers.
- **Examples:** a live endpoint, integration, or worker plus essential registration. Limit endorsement to the inspected aspect and retain known consequential caveats.
- **Tests:** tests that need a database or other services, how those are provided, and what is mocked versus real.
