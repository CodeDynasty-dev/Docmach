# Docmach Roadmap

Goal: make Docmach the SQLite and git of markdown publishing. Plain formats, small core, compatibility that never breaks. Priorities below are ordered; there are no dates.

## Compatibility Rules

These apply to every version.

- **Backward compatibility.** Semver with a written deprecation policy: features are deprecated for at least one major version before removal, with a migration guide.
- **Formats are the public API.** The manifest, the content graph, and the `<docmach>` tag specification are documented and versioned. Anyone can write a renderer for a Docmach site without our involvement.
- **Any version reads any site.** Unknown frontmatter fields, unknown tags, and unknown manifest fields are preserved, not rejected.
- **Output is plain files.** HTML, CSS, JSON, XML. No proprietary runtime required to serve a site.
- **Memory is a tracked constraint.** Docmach compiles 3,000 pages under ~200 MB peak RSS. Memory regressions are treated like build-time regressions.

## v1.1 — Plugin System

The plugin system is the highest-priority item. It must be designed around the AST and the content graph, not string post-processing, so the ecosystem does not inherit the current compiler's limitations.

- **Plugin API and hooks.** Hooks receive structured data (tokens, graph nodes, metadata), not strings.
- **Core plugins prove the API.** Sitemap, RSS, search index, and SEO move out of core and become official plugins. If a core plugin cannot be written with the public API, the API changes first.
- **CLI.** `docmach init`, improved error messages, progress indicators, `--verbose`.
- **Configuration.** `docmach.config.json` as the primary format; `.js`/`.ts` as escape hatch. The `package.json` key is deprecated with a migration path.

## v1.2 — Content Graph

- **Frontmatter.** Standard YAML, parsed at discovery time. Unknown fields preserved.
- **Content graph as the core artifact.** Parse each file once, extract metadata (frontmatter, headings, links, tags, references), store in a documented, versioned format.
- **Manifest.** `docmach-manifest.json` becomes a projection of the graph and remains backward compatible.
- **Collections and taxonomies.** Tags, categories, pagination, sorting, and filtering, built on the graph.
- **Content helpers.** TOC, reading time, related posts, and excerpts as graph plugins.

## v1.3 — Compiler Rewrite

The current compiler is regex- and string-replacement-based. It cannot handle nested structures correctly (known bug: fragments inside wrappers pass through raw into output) and it blocks caching, parallelism, and diagnostics.

- **AST-first rendering.** Parse Markdown to a token tree, process `<docmach>` tags as a parse pass, render once.
- **Persistent content-addressed cache.** Stored in `.docmach-cache/`, keyed by file content, fragment versions, and config. Warm builds skip unchanged work; partial rebuilds become trivial.
- **Worker execution.** Function fragments and plugin code run in worker threads with timeouts.
- **Parallel compilation.** Enabled by the AST and cache work; sequential remains the low-memory fallback.
- **Build profiling.** Slow templates, slow functions, peak memory per build.

## v1.4 — Platform Hygiene

- **Compliance.** CommonMark and GFM test suites run in CI.
- **Watch mode.** Native filesystem events; polling as a documented fallback.
- **Runtimes.** Node LTS and Bun first-class; Deno explored. No runtime-specific APIs in core paths.
- **Quality.** Full TypeScript coverage, comprehensive tests, and benchmarks (build time and peak memory at 3k and 30k pages) tracked like regressions.

## v2.0 — Stable Interfaces

v2.0 locks interfaces, not features.

- **Plugin API v1.** Stable across major versions.
- **Programmatic API.** `parse → graph → render` as a documented, embeddable library interface.
- **i18n.** Locales, language switchers, and RTL via the graph.
- **Components.** Props and slots over the AST; Web Components supported.

## Plugin Territory

The following are out of core. If one requires a core change, the fix is a new hook, not a core feature.

| Area | Examples |
| --- | --- |
| Data | CMS adapters, external APIs, CSV/JSON imports |
| Frameworks | React/Vue/Svelte in Markdown, Web Components |
| Optimization | Image processing, HTML minification, asset bundling, critical CSS |
| Deployment | Per-provider deploy commands, CDN integration, edge prerendering |
| Quality | Link checker, accessibility checker, content linting |
| Dev tools | VS Code extension, browser DevTools, template debugger |
| Hybrid rendering | Server-rendered islands, incremental regeneration |
| Analytics | Content analytics, auto-tagging, A/B testing |
| Enterprise | Multi-site management, access control, audit logging |
| Themes | Theme marketplace, starter templates, component libraries |

## Non-Goals

- No Markdown dialect.
- No proprietary output format or runtime.
- No templating beyond the `<docmach>` tag.
- No trend-driven features in core.

## Metrics

- **Compatibility.** Sites built with v1.1 open unchanged in v2.x and later.
- **Stability.** Plugin API stable across majors; every deprecation ships with a migration guide.
- **Performance.** Faster each release at equal work; 3k pages under ~200 MB; 30k pages build on a laptop.
- **Compliance.** 100% of the CommonMark/GFM suites passing in CI.
- **Trust.** No release breaks an existing site.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Priority follows the tracks above, in order.

- Issues: https://github.com/CodeDynasty-dev/Docmach/issues
- Discussions: https://github.com/CodeDynasty-dev/Docmach/discussions
