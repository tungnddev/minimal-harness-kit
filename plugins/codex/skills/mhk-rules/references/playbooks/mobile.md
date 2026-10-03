<!-- Generated from core/playbooks/mobile.md; edit core/ or adapters/ and run npm run build:plugins. -->

# Mobile discovery prompts

Use relevant prompts for mobile apps, cross-platform or native. Follow the shared cartographer's selection rules; skip categories that add no project-specific guidance.

- **Structure:** runnable app projects, live packages, shared infrastructure, feature boundaries, and each shared package's public entry file.
- **Screens:** representative state management, navigation and its guards/redirects, app-level dependency wiring (DI container or app-wide providers), deep links, and notification wiring.
- **Platform:** where platform-specific or native-bridge code lives (platform channels, native modules, expect/actual), and how a new capability is declared in platform manifests (permissions, entitlements) alongside its runtime request flow.
- **Localization:** source/config locations, call convention, locales, how localization is registered at app startup, and generation command/cwd. Preserve package differences.
- **UI reuse:** public widgets/components, dialogs, lists, forms, and formatters. Read project typography, color, and asset policies separately; one does not imply another.
- **Data:** shared API clients, error/result types, model conversion, and storage entry points.
- **Builds:** generation sources/outputs, and build variants (flavors, schemes, or brands) with the config or entrypoint each uses.
- **Examples:** a live screen or module plus essential registration outside it. Keep code shape in the example.
- **Tests:** tests or runs that need a simulator/device, a build variant, or snapshot baselines.
