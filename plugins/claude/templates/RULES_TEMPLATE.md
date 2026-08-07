Shape-and-length example for a `.claude/rules/<topic>.md` file — illustrative content only, do not copy into a real project.

Only create one of these for a rule that occurs at scattered paths across the repo — not for something confined to one directory (that belongs directly in `CLAUDE.md` instead).

Unlike CLAUDE.md, don't wrap this in `<!-- BEGIN/END: ai-guide -->` markers — frontmatter must be the literal first thing in the file for `paths:` to be recognized, and a marker comment above it would break that. These files are small and single-topic anyway, so propose the whole file each time instead of merging inside a managed block.

---
paths:
  - "**/migrations/**"
---

# Migrations

Migrations are one-way. Never hand-edit a migration file that has already been applied to any environment; write a new migration instead. [confidence: high — evidence: no down() implementations anywhere in migrations/, CONTRIBUTING.md §3]

Keep each rules file scoped to one topic and short — a handful of lines, not a reference doc. If a topic grows past ~30 lines, it's probably several topics; split it rather than letting one file cover unrelated conventions.

---

## Reuse-surface catalog — variant shape

A catalog is a scoped rules file too, but its body is a lookup table of the repo's shared API surface (widgets, dialogs, hooks, helper extensions, base classes) — names and locations, **never code bodies** (a pasted skeleton drifts from the real code and starts lying). Scope its `paths:` to where the surface is *consumed*, not where it's defined, so it loads when someone is writing code that should reuse it:

A repo with more than one shared package gets more than one of these — e.g. a `ui-catalog.md` scoped to `**/presentation/**` for design-system widgets, plus a `core-catalog.md` scoped to the whole `**/src/**` for base classes/client/extensions. Each is its own file with its own `paths:` and its own signpost; don't merge unrelated surfaces into one over-broad catalog.

```
---
paths:
  - "**/presentation/**"
---

# UI reuse catalog

Reuse these before building new. Read the canonical file for exact API.

| Name | Purpose | Import / location |
| ---- | ------- | ----------------- |
| `UIAppBar` | standard app bar — never hand-roll one | `package:ui/ui.dart` |
| `showConfirmDialog` | confirm/cancel dialog | `package:ui/ui.dart` |
| `ListViewLoadMore<T>` | paginated list with pull-to-refresh | `package:ui/ui.dart` |
| `.toCurrency()` | num → `"25,000đ"` | `package:core/core.dart` |
```

Every scoped file (this catalog included) needs a **one-line signpost in CLAUDE.md** — a scoped rule's body loads only when a matching file is *read*, so it's absent during planning and when *creating* a new file. The signpost keeps its existence visible up front:

```
- UI: reuse the shared widget/dialog catalog before building new ones — see .claude/rules/ui-catalog.md
```

---

## Reuse-discipline rule — variant shape

A discipline rule is *not* a catalog — it's an ordinary delta rule that enforces the **mandatory way to use** a shared surface ("always X, never the raw equivalent"). Where a catalog says "these exist," a discipline rule says "use this, not the primitive." It lives directly in CLAUDE.md when cross-cutting, or as a scoped rule + signpost when tied to a layer/filetype.

Measure each axis **independently** (see `repo-cartographer.md` §3) and emit only the axes that clear >70% adherence — one area (e.g. "theming") is usually several axes with opposite adherence, and a passing axis must not be suppressed by a failing sibling:

```
---
paths:
  - "**/presentation/**"
---

# Text styling

Style text via `Theme.of(context).textTheme.<style>?.copyWith(...)` — never a raw `TextStyle()`. [confidence: high — 598 `textTheme.` usages vs 67 raw `TextStyle(`]
```

The axis that fails the bar gets no rule — at most a soft "intended direction, not enforced" note in CLAUDE.md (e.g. inline color literals still widespread, so `UIColor` is the intent, not an enforced rule).
