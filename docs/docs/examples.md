<docmach type="fragment" file="fragments/head.html" params="title: Examples" />
<docmach type="fragment" file="fragments/doc-sidebar.html" />

# Examples

Practical examples showing how to use Docmach for common use cases.

## Blog Post with Layout

**File: `docs/posts/my-first-post.md`**

```html
<docmach
  type="wrapper"
  file="fragments/blog-layout.html"
  replacement="content"
  params="title: My First Blog Post; author: John Doe; date: 2025-12-07"
>
  # Introduction This is my first blog post using Docmach! ## What I Learned -
  Markdown is powerful - Docmach makes it easy - Custom templates are flexible
</docmach>
```

**Layout: `fragments/blog-layout.html`**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{ title }}</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <article class="blog-post">
      <header>
        <h1>{{ title }}</h1>
        <div class="meta">
          <span class="author">By {{ author }}</span>
          <time>{{ date }}</time>
        </div>
      </header>
      <div class="content">{{ content }}</div>
    </article>
  </body>
</html>
```

## Dynamic Navigation

**Function: `fragments/nav.js`**

```js
export default function (params) {
  const { items = [] } = params;

  return `
    <nav class="main-nav">
      <ul>
        ${items
          .map(
            (item) => `
          <li><a href="${item.link}">${item.text}</a></li>
        `
          )
          .join("")}
      </ul>
    </nav>
  `;
}
```

**Usage in Markdown:**

```html
<docmach
  type="function"
  file="fragments/nav.js"
  params="items: {link: /, text: Home}, {link: /about.html, text: About}, {link: /blog.html, text: Blog}"
/>
```

## Auto-Generated Table of Contents

**Function: `fragments/toc.js`**

```js
import { readFileSync } from "fs";

export default function (params) {
  const { file } = params;
  const content = readFileSync(file, "utf8");

  // Extract headings
  const headings = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/\s+/g, "-");
      headings.push({ level, text, id });
    }
  });

  // Generate TOC
  return `
    <nav class="toc">
      <h2>Table of Contents</h2>
      <ul>
        ${headings
          .map(
            (h) => `
          <li class="toc-level-${h.level}">
            <a href="#${h.id}">${h.text}</a>
          </li>
        `
          )
          .join("")}
      </ul>
    </nav>
  `;
}
```

## Reading Time Calculator

**Function: `fragments/reading-time.js`**

```js
import { readFileSync } from "fs";

export default function (params) {
  const { file, wpm = 200 } = params;
  const content = readFileSync(file, "utf8");

  // Count words
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wpm);

  return `<span class="reading-time">${minutes} min read</span>`;
}
```

## Author Bio Component

**Fragment: `fragments/author-bio.html`**

```html
<div class="author-bio">
  <img src="{{ avatar }}" alt="{{ name }}" class="avatar" />
  <div class="info">
    <h3>{{ name }}</h3>
    <p>{{ bio }}</p>
    <div class="social">
      <a href="https://twitter.com/{{ twitter }}">Twitter</a>
      <a href="https://github.com/{{ github }}">GitHub</a>
    </div>
  </div>
</div>
```

**Usage:**

```html
<docmach
  type="fragment"
  file="fragments/author-bio.html"
  params="name: John Doe; bio: Full-stack developer; avatar: /images/john.jpg; twitter: johndoe; github: johndoe"
/>
```

## Code Snippet with Syntax Highlighting

Docmach automatically highlights code blocks:

````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet("Docmach");
```
````

## Conditional Content

**Function: `fragments/conditional.js`**

```js
export default function (params) {
  const { condition, content, fallback = "" } = params;

  return condition ? content : fallback;
}
```

**Usage:**

```html
<docmach
  type="function"
  file="fragments/conditional.js"
  params="condition: true; content: This shows when true; fallback: This shows when false"
/>
```

## Blog Post List

**Function: `fragments/post-list.js`**

```js
import { readFileSync } from "fs";
import { join } from "path";

export default function (params) {
  const manifestPath = join(process.cwd(), "docmach/docmach-manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  // Filter blog posts
  const posts = manifest.pages
    .filter((page) => page.sourcePath.startsWith("docs/posts/"))
    .slice(0, params.limit || 10);

  return `
    <div class="post-list">
      ${posts
        .map(
          (post) => `
        <article class="post-preview">
          <h2><a href="${post.link}">${post.title || "Untitled"}</a></h2>
          <p class="excerpt">${post.excerpt || ""}</p>
          <a href="${post.link}" class="read-more">Read more →</a>
        </article>
      `
        )
        .join("")}
    </div>
  `;
}
```

## Sitemap Generator

**Function: `fragments/sitemap.js`**

```js
import { readFileSync } from "fs";
import { join } from "path";

export default function (params) {
  const { baseUrl = "https://example.com" } = params;
  const manifestPath = join(process.cwd(), "docmach/docmach-manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  const urls = manifest.pages
    .map((page) => {
      return `
    <url>
      <loc>${baseUrl}${page.link}</loc>
      <lastmod>${manifest.generatedAt}</lastmod>
    </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
}
```

## Breadcrumb Navigation

**Function: `fragments/breadcrumbs.js`**

```js
export default function (params) {
  const { path = "/" } = params;
  const parts = path.split("/").filter(Boolean);

  const breadcrumbs = [{ text: "Home", link: "/" }];
  let currentPath = "";

  parts.forEach((part, index) => {
    currentPath += "/" + part;
    const text = part.replace(/-/g, " ").replace(".html", "");
    breadcrumbs.push({
      text: text.charAt(0).toUpperCase() + text.slice(1),
      link: currentPath,
    });
  });

  return `
    <nav class="breadcrumbs">
      ${breadcrumbs
        .map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return isLast
            ? `<span>${crumb.text}</span>`
            : `<a href="${crumb.link}">${crumb.text}</a> / `;
        })
        .join("")}
    </nav>
  `;
}
```

## Multi-Column Layout

**Wrapper: `fragments/two-column.html`**

```html
<div class="two-column-layout">
  <aside class="sidebar">{{ sidebar }}</aside>
  <main class="main-content">{{ content }}</main>
</div>
```

**Usage:**

```html
<docmach
  type="wrapper"
  file="fragments/two-column.html"
  replacement="sidebar"
  params="title: Sidebar"
>
  ## Sidebar Content - Link 1 - Link 2 - Link 3
</docmach>

<docmach type="wrapper" file="fragments/two-column.html" replacement="content">
  # Main Content This is the main content area.
</docmach>
```

## Alert/Callout Boxes

**Fragment: `fragments/alert.html`**

```html
<div class="alert alert-{{ type }}">
  <strong>{{ title }}</strong>
  <p>{{ message }}</p>
</div>
```

**Usage:**

```html
<docmach
  type="fragment"
  file="fragments/alert.html"
  params="type: warning; title: Important; message: This is a warning message"
/>

<docmach
  type="fragment"
  file="fragments/alert.html"
  params="type: info; title: Note; message: This is an informational message"
/>
```

## Next Steps

- Explore the [API Reference](api-reference.html) for complete documentation
- Check out [Advanced Features](advanced-features.html) for more capabilities
- See the [ROADMAP](../../ROADMAP.md) for upcoming features

<docmach type="fragment" file="fragments/doc-sidebar-end.html" />
<docmach type="fragment" file="fragments/footer.html" />
