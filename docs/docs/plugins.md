<docmach type="fragment" file="fragments/head.html" params="title: Plugins" />
<docmach type="fragment" file="fragments/doc-sidebar.html" />

# Plugins

Plugins extend the build through hooks. Hooks receive structured data (config, page metadata, generated html), so plugins stay stable as the compiler evolves.

## Enabling Plugins

List your plugins in the `docmach` key of `package.json`:

```json
{
  "docmach": {
    "docs-directory": "docs",
    "build-directory": "docmach",
    "plugins": [
      "docmach:rss",
      "docmach:search-index",
      { "path": "./plugins/custom.js", "options": { "badge": "BETA" } }
    ]
  }
}
```

A plugin reference can be:

| Reference            | Example                        | Resolves to                                  |
| -------------------- | ------------------------------ | -------------------------------------------- |
| Official plugin      | `"docmach:rss"`                | Plugin bundled with Docmach                  |
| Local file           | `"./plugins/custom.js"`        | Path relative to your project root           |
| Installed package    | `"docmach-plugin-sitemap"`     | A package in your `node_modules`, ESM or CommonJS |
| With options         | `{ "path": "...", "options": {} }` | Same as above, options passed to the factory |

Plugins load once when Docmach starts, in the order they are listed. Restart the dev server after changing the plugin list. References that are not a string, a `{ path }` object, or a valid plugin module are reported and skipped, so a typo in the list never fails a build.

## Official Plugins

### RSS

Generates an RSS 2.0 feed of the most recently updated pages. Titles come from each page's first `<h1>`, falling back to `<title>`, then the link.

| Option          | Default     | Description                                            |
| --------------- | ----------- | ------------------------------------------------------ |
| `title`         | `"Docmach site"` | Channel title                                     |
| `description`   | `""`        | Channel description                                    |
| `output`        | `"rss.xml"` | File name written to the build directory               |
| `limit`         | `50`        | Maximum number of items                                |
| `site-url`      | config `site-url` | Base url for links, required to generate a feed  |

### Search Index

Writes a JSON index of every page that a static site can fetch and search client side.

| Option              | Default              | Description                          |
| ------------------- | -------------------- | ------------------------------------ |
| `output`            | `"search-index.json"` | File name written to the build directory |
| `descriptionLength` | `160`                | Maximum characters of the page excerpt |

```js
const results = await fetch("/search-index.json").then((res) => res.json());
// [{ "title": "First post", "description": "...", "url": "/blog/post.html", "source": "docs/blog/post.md" }]
```

## Hook Reference

| Hook            | Runs                                     | Receives                                            |
| --------------- | ---------------------------------------- | --------------------------------------------------- |
| `preBuild`      | Once, before files are discovered        | `{ config }`                                        |
| `transformHtml` | Per page, before the file is written     | Page context, return a string to replace the html   |
| `page`          | Per page, after the file is written      | Page context                                        |
| `postBuild`     | Once, after the manifest and sitemap     | `{ config, pages }`                                 |

The page context looks like this:

```ts
type PageContext = {
  sourcePath: string; // "docs/blog/post.md"
  outputPath: string; // "docmach/blog/post.html"
  link: string; // "/blog/post.html"
  docmachTags: DocmachTagMetadata[];
  html: string; // the generated html
};
```

`pages` is the same list of page metadata written to `docmach-manifest.json`. Lifecycle hooks (`preBuild`, `postBuild`) only run on full builds, so incremental rebuilds stay cheap.

## Writing a Plugin

A plugin is a module exporting `{ name, hooks }`, or an options factory returning one. Hook names describe the pipeline stage, nothing more.

```js
// plugins/reading-time.js
export default function readingTime(options = {}) {
  const wordsPerMinute = options.wordsPerMinute ?? 200;
  return {
    name: "reading-time",
    hooks: {
      async transformHtml(page) {
        const words = page.html.replace(/<[^>]+>/g, " ").split(/\s+/).length;
        const minutes = Math.max(1, Math.round(words / wordsPerMinute));
        return page.html.replace(
          "</body>",
          `<p class="reading-time">${minutes} min read</p></body>`,
        );
      },
    },
  };
}
```

`transformHtml` hooks run in the order the plugins are listed. Returning a string replaces the page html, returning nothing leaves it unchanged. Async hooks are awaited, and plugins are executed sequentially, so builds stay orderable and predictable.

### Error Isolation

A hook that throws is reported once per plugin and hook, and the build continues. Other plugins and other pages are unaffected.

### Watch Mode

`preBuild` and `postBuild` run on full builds only. During watch mode an edited page runs through `transformHtml` and `page` again, but the lifecycle hooks and official plugins like `docmach:rss` do not rerun. Restart Docmach after changing a plugin file's exports or the plugin list.

### TypeScript

Plugin types are exported from the package:

```ts
import type { DocmachPlugin, PageContext } from "docmach";

const plugin: DocmachPlugin = {
  name: "typed-plugin",
  hooks: {
    transformHtml(page: PageContext) {
      return page.html;
    },
  },
};
```

### Notes

- Plugin code runs in the build process and is trusted like your own site code.
- Page context paths (`sourcePath`, `outputPath`) are relative to `cwd()`, so join them with `cwd()` to read or write files. Config paths (`docs-directory`, `build-directory`, `assets-folder`, `root`) are already absolute, use them as is.
- The build directory exists by the time `preBuild` runs, so hooks can write into it on a fresh build.
- Local plugin files can be plain `.js` or `.ts` when your runtime supports it. Node runs `.js` as is; to use TypeScript plugin files, run Docmach with a TypeScript-aware loader.

<docmach type="fragment" file="fragments/doc-sidebar-end.html" />
<docmach type="fragment" file="fragments/footer.html" />
