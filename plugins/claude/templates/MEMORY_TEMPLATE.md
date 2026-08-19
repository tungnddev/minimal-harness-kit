Shape reference for a promoted memory file at `.mhk/memory/<slug>.md` — illustrative only, do not copy into a real project.

## This file is a FAITHFUL MIRROR of Claude's native auto-memory format

A `.mhk/memory/<slug>.md` file is a byte-for-byte-shaped copy of a native
auto-memory file — the same frontmatter and the same body conventions Claude
Code writes into its own per-project memory store. This is deliberate and is the
core of the design:

- `/mhk:memory` compares the mirrored store against the live native store
  **like-for-like**. Because the mirror uses the native shape, a change to the
  native format (a new frontmatter key, a different `metadata` shape, a changed
  index convention) shows up as a **diff on the next run** instead of being
  hidden behind a translation layer. mhk tracks Claude's evolving memory format
  for free.
- Therefore: **never invent mhk-specific frontmatter**, and never add mhk fields
  *inside* this file. There is no side bookkeeping file at all — the store IS the
  state. What would have been "bookkeeping" is encoded by *where a fact lives*:
  a file under `.mhk/memory/` is a promoted pull-index fact; a fact elevated to
  the opt-in scoped-rule tier lives in `.claude/rules/*` instead.

## The native shape mhk mirrors

```
---
name: <short-kebab-case-slug>
description: <one-line summary, used to decide relevance during recall>
metadata:
  type: user | feedback | project | reference
---

<the fact. For feedback/project, follow with **Why:** and **How to apply:** lines.
Link related memories with [[their-slug]].>
```

Only `type: project` and `type: reference` facts are promotion candidates in the
first place — `user` (who the developer is) and most `feedback` (how *you* should
work) are personal-to-this-developer and stay local. `/mhk:memory` applies the
portability filter (repo-general × verified × non-derivable × durable) before
anything reaches a committed path.

## The index is its own file: `.mhk/memory/MEMORY.md`, a mirror of native `MEMORY.md`

The promoted facts are indexed in a committed file, `.mhk/memory/MEMORY.md`, that
mirrors Claude's native `MEMORY.md` — the same one-line-pointer style (a link
plus a short relevance hook). Keeping the index as a file next to the fact bodies
means `/mhk:memory` owns the whole `.mhk/memory/` store and CLAUDE.md never
has to change when memory grows: it carries just one **static pointer** to this
index (see `CLAUDE_TEMPLATE.md`). It also makes the index itself
byte-comparable to native `MEMORY.md`, so an index-convention change on the
native side surfaces as a sync diff too.

```
# Project memory (promoted)

- [Driver wallet on cancel](driver-wallet-cancel.md) — when touching cancellation/refund flows
```

The trailing hook is what makes a committed pointer useful: committed files get
model-discretion *pull*, not the harness *recall* that powers native memory, so
the hook has to read as a trigger ("when X …"). Links inside `MEMORY.md` are
relative to `.mhk/memory/` (sibling files), exactly as native `MEMORY.md` links
to its siblings.

## Who owns what

- **`/mhk:memory`** owns everything under `.mhk/memory/` — the `<slug>.md`
  fact files *and* `MEMORY.md`. It is the only writer here.
- **`/mhk:rules`** owns the one static pointer line in CLAUDE.md that names
  `.mhk/memory/MEMORY.md`. It never reads, writes, or reorders anything under
  `.mhk/memory/`.
- **There is no side bookkeeping file.** The store is the whole state: a fact's
  presence under `.mhk/memory/` means it's promoted, and its tier is recorded by
  which directory it lives in (`.mhk/memory/` = pull-index; `.claude/rules/` =
  opt-in scoped rule).
