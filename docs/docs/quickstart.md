<docmach type="fragment" file="fragments/head.html" params="title: Docmach Quickstart" />
<docmach type="fragment" file="fragments/doc-sidebar.html" />

# Quickstart

Get started with Docmach in a few simple steps.

## Installation

```bash
# Install locally
npm i docmach
npx docmach

# Or install globally
npm i docmach -g
docmach
```

## Create a New Project

```bash
mkdir my-docs
cd my-docs
```

## Basic Configuration

Add the following to your `package.json` file:

```json
"docmach": {
  "docs-directory": "./docs",
  "build-directory": "./docmach",
  "assets-folder": "./assets"
}
```

## Create Your First Document

Create a file called `index.md` in your docs directory:

```markdown
<docmach type="fragment" file="template.html" params="title=My First Docmach Page">

<docmach type="wrapper" replacement="replacement" file="fragments/post-wrapper.html" params="title: post 2;">

<h1>Nice h1 tag</h1>

</docmach>

# Hello Docmach!

This is my first page created with Docmach.

</docmach>
```

## Start the Development Server

```bash
docmach
```

## Build for Production

```bash
docmach build
```

This command:

- Compiles all Markdown files to HTML
- Copies assets to build directory
- Generates `docmach-manifest.json`
- Compiles Tailwind CSS

## Visualize Your Site Structure

```bash
docmach print
```

Displays a tree view of all generated pages:

```
Docmach site structure
┬
├── /docs/
  ├── /introduction.html
  ├── /quickstart.html
├── /index.html
```

## Programmatic API

Use Docmach as a library:

```js
import Docmach from "docmach";

// Compile specific file
await Docmach("docs/my-post.md");
```

Perfect for:

- Dynamic blog engines
- CMS integrations
- On-demand page generation

## View Your Site

Open your browser and navigate to `http://localhost:4000`

## Next Steps

- Create more Markdown files in your docs directory
- Customize templates in your fragments directory
- Add function templates for dynamic content
- Explore custom themes and Tailwind CSS options

<docmach type="function" file="fragments/doc-nav.js" 
params="prev: {link: /docs/introduction.html, text: Introduction }; next: {link: /docs/configuration.html, text: Configurations };" 
/>
<docmach type="fragment" file="fragments/doc-sidebar-end.html" />
<docmach type="fragment" file="fragments/footer.html" />
