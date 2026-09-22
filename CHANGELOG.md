# Changelog

All notable changes to Docmach will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.20] - 2025-12-07

### Added

- **Build Manifest Generation** - Automatically generates `docmach-manifest.json` containing all pages, links, and docmach tag metadata
- Manifest includes source paths, output paths, URL links, and complete tag information
- Metadata extraction for all docmach tags (fragments, functions, wrappers)
- Enhanced documentation with advanced features guide
- API reference documentation
- Comprehensive roadmap for future development
- Contributing guidelines

### Changed

- Improved compiler to extract tag metadata before processing
- Parser now collects page metadata during compilation
- Manifest only generated during full builds (not incremental updates)

### Documentation

- Added `docs/docs/advanced-features.md` - Advanced usage patterns
- Added `docs/docs/api-reference.md` - Complete API documentation
- Added `ROADMAP.md` - Strategic development plan
- Added `CONTRIBUTING.md` - Contribution guidelines
- Enhanced README with better examples and CLI documentation

## [1.0.19] - Previous Release

### Features

- Markdown compilation with syntax highlighting (highlight.js)
- Custom templating system with `<docmach>` tags
- Fragment templates with variable substitution
- Function templates for dynamic content
- Wrapper templates for layout composition
- Tailwind CSS integration
- Live development server with WebSocket hot reload
- File watching with incremental builds
- Template caching with LRU cache
- Asset copying and management
- CLI commands: `docmach`, `docmach build`, `docmach print`

### Core Capabilities

- Markdown-it parser with HTML support
- Chokidar file watcher
- WebSocket server for live reload
- Throttled rebuilds (250ms)
- Template dependency tracking
- Incremental asset copying
- Auto port selection (starting from 4000)

## Upcoming Features

See [ROADMAP.md](ROADMAP.md) for the strategic plan and priority tracks:

1. **Track 1 (v1.1)** — Plugin system + hooks (designed around the AST/content graph), CLI polish, config done right
2. **Track 2 (v1.2)** — Frontmatter and the content graph; manifest becomes a projection of the graph
3. **Track 3 (v1.3)** — AST-first compiler, persistent content-addressed cache, worker isolation, parallel compilation
4. **Track 4 (v1.4)** — CommonMark/GFM compliance, cross-runtime, watch-mode and quality infrastructure
5. **Track 5 (v2.0)** — Stable, semver-locked plugin and programmatic APIs

## Migration Guides

### Upgrading to 1.0.20

No breaking changes. The manifest feature is automatically enabled during builds.

**New files generated:**

- `{build-directory}/docmach-manifest.json`

**To use the manifest:**

```js
import manifest from "./docmach/docmach-manifest.json";

// Access page metadata
manifest.pages.forEach((page) => {
  console.log(page.link, page.docmachTags);
});
```

## Support

- **Issues:** [GitHub Issues](https://github.com/CodeDynasty-dev/Docmach/issues)
- **Discussions:** [GitHub Discussions](https://github.com/CodeDynasty-dev/Docmach/discussions)
- **Documentation:** [docs/](docs/)

---

[1.0.20]: https://github.com/CodeDynasty-dev/Docmach/releases/tag/v1.0.20
[1.0.19]: https://github.com/CodeDynasty-dev/Docmach/releases/tag/v1.0.19
