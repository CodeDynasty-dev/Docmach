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

# Hello Docmach!

This is my first page created with Docmach.

</docmach>
```

## Start the Development Server

```bash
docmach
```

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