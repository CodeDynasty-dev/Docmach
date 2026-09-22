# Docmach Roadmap

**Docmach aims to be the SQLite and git of markdown publishing.** Boring on the surface, correct underneath, trustworthy forever. This roadmap is not a list of features — it is a list of _load-bearing decisions_, ordered by priority.

> No dates in this document. Order is priority. If something below is done out of order, the order was wrong.

---

## The Doctrine

Every item below must pass three tests before it enters the core:

1. **Data outlives code.** A site built with Docmach 1.x must open in Docmach 100.x with zero migration. The _storage formats_ (Markdown, frontmatter, manifest, content graph) are the only things that live forever.
2. **Standards over invention.** CommonMark/GFM compliance, standard YAML frontmatter, predictable URLs, documented JSON formats. Docmach invents exactly one syntax — the `<docmach>` tag — and it is specified, versioned, and stable.
3. **Small core, everything else a plugin.** The core does three things: **parse markdown → build the content graph → render files.** Nothing else. Themes, SEO, RSS, search, analytics, CMS adapters: plugins.

## The Laws

Non-negotiable. Apply to every version, forever. Breaking any law requires a supermajority of the community, not a maintainer's decision.

- **Backward compatibility is law.** Semantic versioning. A written deprecation policy: features are marked deprecated for at least one major version before removal, with migration guides.
- **The formats are the public API.** The manifest, the content graph, and the `<docmach>` tag specification are documented, versioned public artifacts. Anyone may write a new renderer for a Docmach site without permission.
- **Any version reads any site.** Unknown frontmatter fields, unknown tags, unknown manifest fields are preserved, not rejected.
- **The compiler is replaceable; the output is forever.** A Docmach site is plain files: HTML, CSS, JSON, XML. No proprietary runtime is required to serve it.
- **The memory constraint is a design constraint.** Docmach was born on an 8GB laptop compiling 3,000 pages under ~200 MB peak RSS. Peak memory is tracked in benchmarks like build time. Regressions in memory are regressions.

---

## Track 1 — Foundations for the Ecosystem (v1.1, next)

The plugin system is the most strategic feature in Docmach — more than frontmatter, more than performance. It must be designed around the AST and the content graph, **not** around string post-processing, or the ecosystem is locked into the fragile layer.

- **Plugin API + hook system.** Hooks receive structured data (tokens/graph nodes/metadata), not strings. Pre/post build hooks, per-file processing hooks.
- **Core plugins prove the API.** Sitemap, RSS feed, search index, SEO meta — all move out of core and become official plugins. If a core plugin can't be written with the public API, the API is wrong.
- **CLI polish.** `docmach init` scaffolding, helpful errors with suggestions, progress indicators, `--verbose`.
- **Config done right.** `docmach.config.json` (documented, versionable) as primary; `docmach.config.js`/`.ts` as escape hatch. Schema validation. The `package.json` `docmach` key is deprecated with a migration path.

## Track 2 — The Content Graph (v1.2)

Files are the database; the graph is the interface to it. This is the centerpiece of Docmach's data model and the reason collections, i18n, search, and related-posts are all cheap later.

- **Frontmatter.** Standard YAML, parsed at discovery time. Unknown fields preserved.
- **Content graph as core artifact.** Parse every file once → extract metadata (frontmatter, headings, links, tags, references) → build a persistent, queryable graph. Supported by a documented, versioned storage format.
- **The manifest becomes a projection of the graph.** `docmach-manifest.json` keeps backward compatibility, but its shape is now derived, documented, and versioned.
- **Collections & taxonomies.** Grouping by directory or frontmatter, tags/categories, pagination, sorting/filtering — built _on the graph_, not on the render loop.
- **Content helpers as graph plugins.** Table of contents, reading time, related posts, excerpt generation.

## Track 3 — The Compiler (v1.3)

The current string-manipulation pipeline is Docmach's biggest architectural debt. It cannot be made fully correct (nested structures break regex parsing) and it blocks caching, parallelism, and diagnostics.

- **AST-first rendering.** Parse Markdown to a token tree; process `<docmach>` tags as a proper parse pass over the tree; render once. Correct nesting, diagnostics with line numbers, no more placeholder-restore chains.
- **Persistent, content-addressed cache.** Cache key = hash of (file content + fragment versions + config). Stored in `.docmach-cache/`. Cold builds compile everything; warm builds compile nothing; partial rebuilds become trivial.
- **Worker execution for user code.** `function` fragments and plugin code run in worker threads with timeouts and isolated failure. One bad user template can no longer hang the build.
- **Parallel compilation.** Multi-worker rendering, enabled by the AST + cache work. Sequential remains the fallback on low-memory machines.
- **Build profiling.** Identify slow templates/functions; report peak memory per build.

## Track 4 — Platform Hygiene (v1.4)

- **CommonMark/GFM compliance suite.** Run the official test suites in CI. Docmach invents one syntax; everything else follows the spec.
- **Watch mode done right.** Native filesystem events where available; polling only as documented fallback.
- **Cross-runtime.** Node LTS first-class, Bun first-class, Deno explored. No runtime-specific APIs in core paths.
- **100% TypeScript, comprehensive tests.** Unit, integration, e2e; performance benchmarks (build time + peak memory for 3k/30k pages) tracked like any regression.

## Track 5 — Stable Interfaces (v2.0)

Version 2.0 is not a feature release. It is a **promise release**: the interfaces below become semver-locked and backed by the compatibility law.

- **Plugin API v1.** Stable across major versions. A plugin written for v2.0 compiles a v100 site.
- **Programmatic API.** Use Docmach as an embeddable library — the SQLite model. `parse → graph → render` as a documented three-call interface.
- **i18n via the graph.** Locale directories, language switchers, RTL — all graph queries, no core magic.
- **Component system via plugins.** Props & slots over the AST; Web Components supported; no framework lock-in in core.

---

## Everything Else Belongs in Plugins

These are valuable and explicitly **out of core**. The plugin ecosystem (official or community) is where they live:

| Area             | Examples                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Data             | CMS adapters (Contentful, Sanity, Strapi, Ghost, WordPress), external APIs, CSV/JSON imports |
| Frameworks       | React/Vue/Svelte in Markdown, Web Components                                                 |
| Optimization     | Image resizing, HTML minification, asset bundling, critical CSS, asset fingerprinting        |
| Deployment       | `deploy` commands per provider, CDN integrations, edge prerendering                          |
| Quality          | Link checker, accessibility checker, content linting, visual regression                      |
| Developer tools  | VS Code extension, browser DevTools, template debugger                                       |
| Hybrid rendering | Server-rendered islands, incremental regeneration                                            |
| Analytics & AI   | Content analytics, auto-tagging, SEO suggestions, A/B testing                                |
| Enterprise       | Multi-site management, access control, workflow automation, audit logging                    |
| Themes           | Theme marketplace, starter templates, component libraries                                    |

If any of these ever needs a core change, that indicates a missing hook — the fix is the hook, not the feature.

## Non-Goals

Docmach will refuse these in core, forever:

- **No markdown dialect.** If your syntax doesn't render in a CommonMark-compliant renderer, it's not markdown.
- **No proprietary output format or runtime.** Sites are plain files.
- **No invented templating beyond the `<docmach>` tag.** The tag is specified and stable; nothing else is added to the surface.
- **No features in core that belong in plugins.** A hook beats a feature. Every core feature is a compatibility promise for decades.
- **No trend-chasing.** AI, frameworks, and platforms come and go; Markdown, YAML, and static files do not.

## Success Metrics

- **Durability:** every site built with v1.1 opens in v2.x unchanged. Every site built with v2.x opens in v3.x unchanged.
- **Stability:** plugin API stable across major versions; deprecations always accompanied by migration guides.
- **Performance:** each release is faster than the last at equal work; peak memory for 3k pages stays under ~200 MB; 30k pages compiles on a laptop.
- **Compliance:** 100% of the CommonMark/GFM suite, tracked in CI.
- **Trust:** users trust Docmach because it has never broken their site. Trust is the metric.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Priority areas follow the tracks above, in order.

## Feedback

- Issues: https://github.com/CodeDynasty-dev/Docmach/issues
- Discussions: https://github.com/CodeDynasty-dev/Docmach/discussions
- Twitter: [@docmach](#)

---

_This roadmap is subject to reordering based on community feedback — but the Doctrine and the Laws are not negotiable._
