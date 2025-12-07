<docmach type="fragment" file="fragments/head.html" params="title: API Reference" />
<docmach type="fragment" file="fragments/doc-sidebar.html" />

# API Reference

Complete reference for Docmach configuration, tags, and programmatic usage.

## Configuration

Configure Docmach in your `package.json`:

```json
{
  "docmach": {
    "docs-directory": "docs",
    "build-directory": "docmach",
    "assets-folder": "assets"
  }
}
```

### Configuration Options

| Option            | Type   | Default       | Description                                    |
| ----------------- | ------ | ------------- | ---------------------------------------------- |
| `docs-directory`  | string | `"."` (root)  | Source directory containing Markdown files     |
| `build-directory` | string | `"./docmach"` | Output directory for generated HTML            |
| `assets-folder`   | string | `""` (none)   | Directory with static assets to copy to output |

## Docmach Tag Syntax

### Fragment Tag

Self-closing tag for HTML templates with variable substitution:

```html
<docmach
  type="fragment"
  file="path/to/template.html"
  params="key1: value1; key2: value2"
/>
```

**Attributes:**

- `type`: Must be `"fragment"`
- `file`: Path to HTML template file (relative to project root)
- `params`: Semicolon-separated key-value pairs (optional)

**Template syntax:**

```html
<div>
  <h1>{{ key1 }}</h1>
  <p>{{ key2 }}</p>
</div>
```

### Function Tag

Self-closing tag for JavaScript-generated content:

```html
<docmach
  type="function"
  file="path/to/function.js"
  params="key1: value1; key2: value2"
/>
```

**Attributes:**

- `type`: Must be `"function"`
- `file`: Path to JavaScript module (relative to project root)
- `params`: Parameters passed to function (optional)

**Function signature:**

```js
export default function (params) {
  // params = { key1: "value1", key2: "value2" }
  return `<div>Generated HTML</div>`;
}
```

### Wrapper Tag

Wrapping tag for composing layouts around Markdown content:

```html
<docmach
  type="wrapper"
  file="path/to/layout.html"
  replacement="placeholder"
  params="key: value"
>
  # Markdown content here This content will be rendered and inserted into {{
  placeholder }}
</docmach>
```

**Attributes:**

- `type`: Must be `"wrapper"`
- `file`: Path to HTML layout template
- `replacement`: Name of placeholder in template where content will be inserted
- `params`: Parameters for template variables (optional)

## Parameter Syntax

### Simple Values

```html
params="title: My Page; author: John Doe; count: 42"
```

Results in:

```js
{ title: "My Page", author: "John Doe", count: 42 }
```

### Nested Objects

```html
params="user: {name: John, age: 30, email: john@example.com}"
```

Results in:

```js
{ user: { name: "John", age: 30, email: "john@example.com" } }
```

### Mixed Parameters

```html
params="title: My Post; author: {name: John Doe, bio: Developer}; published:
true"
```

Results in:

```js
{
  title: "My Post",
  author: { name: "John Doe", bio: "Developer" },
  published: true
}
```

## CLI Commands

### Development Server

```bash
docmach
```

Starts development server with:

- Live reload via WebSocket
- File watching for auto-rebuild
- Serves on `http://localhost:4000` (or next available port)

### Production Build

```bash
docmach build
```

Builds site for production:

- Compiles all Markdown files
- Copies assets
- Generates `docmach-manifest.json`
- Compiles Tailwind CSS

### Print Site Structure

```bash
docmach print
```

Displays all pages in the build directory.

## Programmatic API

### Import and Use

```js
import Docmach from "docmach";

// Compile specific file
await Docmach("docs/my-page.md");
```

### Use Cases

**Dynamic Blog Engine:**

```js
// User creates post via API
const postContent = await saveToS3(userPost);
await writeFile("docs/posts/new-post.md", postContent);
await Docmach("docs/posts/new-post.md");
// Serve from build directory with Nginx
```

**CMS Integration:**

```js
// On content update webhook
app.post("/webhook/content-update", async (req, res) => {
  const { filePath } = req.body;
  await Docmach(filePath);
  res.json({ success: true });
});
```

## Build Manifest Schema

Generated at `{build-directory}/docmach-manifest.json`:

```typescript
interface Manifest {
  generatedAt: string; // ISO 8601 timestamp
  pages: PageMetadata[];
}

interface PageMetadata {
  sourcePath: string; // Relative path to source .md file
  outputPath: string; // Relative path to generated .html file
  link: string; // URL path (relative to /)
  docmachTags: DocmachTag[];
}

interface DocmachTag {
  type: "fragment" | "function" | "wrapper";
  file?: string; // Template/function file path
  params?: Record<string, any>;
  replacement?: string; // Wrapper only
}
```

<docmach type="fragment" file="fragments/doc-sidebar-end.html" />
<docmach type="fragment" file="fragments/footer.html" />
