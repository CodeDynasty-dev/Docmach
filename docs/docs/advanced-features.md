<docmach type="fragment" file="fragments/head.html" params="title: Advanced Features" />
<docmach type="fragment" file="fragments/doc-sidebar.html" />

# Advanced Features

Docmach provides powerful features for building sophisticated documentation sites and blogs.

## Build Manifest

Every build generates a `docmach-manifest.json` file containing complete metadata about your site:

```json
{
  "generatedAt": "2025-12-07T13:33:30.482Z",
  "pages": [
    {
      "sourcePath": "docs/post.md",
      "outputPath": "docmach/post.html",
      "link": "/post.html",
      "docmachTags": [
        {
          "type": "fragment",
          "file": "fragments/head.html",
          "params": { "title": "My Post" }
        }
      ]
    }
  ]
}
```

### Use Cases for Manifest

- **Auto-generate navigation** - Build dynamic menus from all pages
- **Create sitemaps** - Generate XML sitemaps for SEO
- **Analyze dependencies** - See which templates are used where
- **Build search indexes** - Create client-side search functionality
- **Generate RSS feeds** - Auto-create feeds from blog posts

## Wrapper Tags

Wrappers provide a powerful way to compose layouts:

```html
<docmach
  type="wrapper"
  file="fragments/article-layout.html"
  replacement="content"
  params="title: My Article; author: John Doe"
>
  # Article Content This Markdown content will be rendered and inserted into the
  layout. ## Section 1 Your content here...
</docmach>
```

**Layout file (article-layout.html):**

```html
<article class="prose">
  <header>
    <h1>{{ title }}</h1>
    <p class="author">By {{ author }}</p>
  </header>
  <div class="content">{{ content }}</div>
</article>
```

## Function Templates

Functions enable dynamic content generation with full JavaScript capabilities:

```js
// fragments/blog-list.js
export default function (params) {
  const { posts, limit = 10 } = params;

  return posts
    .slice(0, limit)
    .map(
      (post) => `
    <article>
      <h2><a href="${post.link}">${post.title}</a></h2>
      <time>${post.date}</time>
      <p>${post.excerpt}</p>
    </article>
  `
    )
    .join("\n");
}
```

**Usage:**

```html
<docmach
  type="function"
  file="fragments/blog-list.js"
  params="posts: {title: Post 1, link: /post1.html, date: 2025-01-01}; limit: 5"
/>
```

## Nested Parameters

Docmach supports complex nested object parameters:

```html
<docmach
  type="function"
  file="fragments/author-card.js"
  params="author: {name: John Doe, bio: Developer, social: {twitter: @johndoe, github: johndoe}}"
/>
```

## Template Caching

Docmach uses an LRU cache (max 100 entries) for templates:

- **Fast rebuilds** - Templates are cached in memory
- **Dependency tracking** - Changes to templates trigger rebuilds of dependent pages
- **Incremental updates** - Only affected files are recompiled

## Programmatic API

Use Docmach as a library for dynamic content:

```js
import Docmach from "docmach";

// Compile a single file
await Docmach("docs/my-post.md");

// Perfect for:
// - Dynamic blog engines
// - CMS integrations
// - On-demand page generation
// - API-driven documentation
```

## Live Reload

Development server features:

- **WebSocket-based** - Instant updates without polling
- **Smart injection** - Live reload script auto-injected before `</body>`
- **Auto port selection** - Finds available port starting from 4000
- **Throttled rebuilds** - Batches rapid changes (250ms throttle)

## Asset Management

Intelligent asset handling:

- **Incremental copying** - Only changed files are copied
- **Timestamp comparison** - Skips unchanged assets
- **Automatic directory creation** - Mirrors source structure
- **Supports all file types** - Images, CSS, JS, fonts, etc.

<docmach type="fragment" file="fragments/doc-sidebar-end.html" />
<docmach type="fragment" file="fragments/footer.html" />
