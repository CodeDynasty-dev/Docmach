# Docmach

**Docmach** is a **Markdown-powered** static site generator designed for **modern blogs and project documentation**. It integrates **the simplicity of Markdown and Tailwind CSS** to generate sites with minimal effort.

## Features

- **Markdown Compilation** – Write Markdown with full HTML support and syntax highlighting
- **Custom Templating System** – Use fragments, functions, and wrappers via `<docmach>` tags
- **Tailwind CSS Integration** – Built-in Tailwind CSS compiler for beautiful, responsive designs
- **Live Reload & Watch Mode** – Instant preview with WebSocket-based hot reload
- **Incremental Builds** – Smart caching and dependency tracking for fast rebuilds
- **Build Manifest** – Auto-generated JSON manifest with page metadata and tag information
- **Programmatic API** – Use Docmach as a library for dynamic content generation
- **Simple Configuration** – Minimal setup required to get started

[See more](https://docmach.codedynasty.dev/)

## Installation

```sh
# Install locally
npm i docmach
npx docmach

# Or install globally
npm i docmach -g
docmach
```

## Configuration

Add the following to your `package.json` file:

```json
"docmach": {
  "docs-directory": "./docs",
  "build-directory": "./docmach",
  "assets-folder": "./assets"
}
```

### Configuration Options

| Option              | Description                                  | Default        |
| ------------------- | -------------------------------------------- | -------------- |
| **docs-directory**  | Directory containing your Markdown files     | Root directory |
| **build-directory** | Output directory for the generated site      | `./docmach`    |
| **assets-folder**   | Directory with assets to be copied to output | None           |

## 🧩 How Docmach Works

Docmach parses all .md files in your input folder, extracting and processing Markdown and HTML content. It uses special Docmach tag to apply templates and functions.

### Docmach tag

Docmach tag work similarly to HTML tags:

```html
<docmach
  type="fragment"
  file="template.html"
  params="title=My Page; author=JohnDoe"
/>

<!-- Yes this works, passed as function parameter -->
<docmach
  type="function"
  file="author-bio.js"
  params="title=My Page; author={name: JohnDoe, age: 24, date: 20th March 2015}"
/>
```

### Using Fragment

```html
<!-- template.html -->

<html>
  <head>
    <title>{{ title }}</title>
  </head>
  <body>
    <h2>{{ author }}</h2>
  </body>
</html>
```

### Using Function tags

```js
// in author-bio.js
export default function (title, author) {
  return `
   <div>
   <h1>by ${title}</h1>
   <h3>by ${author.name}</h3>
   <p>Aged: ${author.age}</p>
   <p>On: ${author.date}</p>
   </div>
   `;
}
// such functions should do it works fast please.
```

### Docmach Attributes

| Attribute       | Type   | Description                                                               |
| --------------- | ------ | ------------------------------------------------------------------------- |
| **type**        | string | Template type: `"fragment"`, `"function"`, or `"wrapper"`                 |
| **file**        | string | Location of template code: `.html` for fragments or `.js` for functions   |
| **params**      | string | Parameters passed to templates (supports objects: `key: {nested: value}`) |
| **replacement** | string | (Wrapper only) Placeholder name where content will be inserted            |

### Using Wrapper Tags

Wrappers allow you to wrap Markdown content with custom HTML:

```html
<docmach
  type="wrapper"
  file="layout.html"
  replacement="content"
  params="title: My Page"
>
  # This Markdown content will be wrapped Your content here gets inserted into
  the `{{ content }}` placeholder.
</docmach>
```

## CLI Commands

```bash
docmach              # Start dev server with live reload
docmach build        # Build for production
docmach print        # Visualize all pages in your site
```

## Build Manifest

Docmach automatically generates `docmach-manifest.json` during builds, containing:

- All page paths and URLs
- Docmach tags used in each page
- Template dependencies and parameters

Perfect for building navigation, sitemaps, or analyzing your site structure.

## Why Choose Docmach?

- **Live Reload That Actually Works** 🔄 – See changes instantly
- **CLI That Doesn't Get in Your Way** 🛠️ – Simple, intuitive commands
- **Developer Experience Focused** 🌟 – Built with modern web development workflows in mind
- **Flexible & Extensible** 🧩 – Adapt to your project needs without complexity

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and future direction.

**Upcoming features:**

- Plugin system for extensibility
- Frontmatter support (YAML/TOML)
- Collections and taxonomies
- i18n support
- CMS integrations

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Quick start:**

```bash
git clone https://github.com/CodeDynasty-dev/Docmach.git
cd Docmach
npm install
npm run watch
```

## Documentation

- [Introduction](docs/docs/introduction.md)
- [Quickstart Guide](docs/docs/quickstart.md)
- [Configuration](docs/docs/configuration.md)
- [Advanced Features](docs/docs/advanced-features.md)
- [API Reference](docs/docs/api-reference.md)

## License

Apache License 2.0
