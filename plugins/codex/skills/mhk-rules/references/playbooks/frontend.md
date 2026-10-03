<!-- Generated from core/playbooks/frontend.md; edit core/ or adapters/ and run npm run build:plugins. -->

# Frontend discovery prompts

Use relevant prompts for web applications and frontend libraries. Follow the shared cartographer's selection rules; skip categories that add no project-specific guidance.

- **Structure:** app entry points, routing and route guards, feature/component boundaries, and shared packages.
- **Rendering:** rendering mode (client, server, static, or mixed), any server/client code boundary, where data is fetched, and which configuration is exposed to the browser.
- **State/data:** app-wide providers or plugins, the shared data-access layer (hooks, services, or stores), cache conventions, and what must follow a write (cache invalidation, refetch, user feedback).
- **UI reuse:** design-system components, tokens, utilities, and shared UI logic (hooks, composables, or directives). Read typography, color, and spacing policies separately; mixed usage does not invalidate explicit policy.
- **Localization:** message sources, call conventions, differences between apps or packages, and generation steps.
- **Codegen:** schema/source files, generated clients, regeneration command/cwd, and outputs to avoid editing.
- **Examples:** a live page or feature plus essential route/provider registration. Keep implementation detail in source.
- **Tests:** end-to-end or browser tests that need a running app, installed browsers, or test accounts/configuration.
