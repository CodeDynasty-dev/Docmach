<docmach type="fragment" file="fragments/head.html" params="title: introduction" />
<docmach type="fragment" file="fragments/doc-sidebar.html" />

# Docmach - Markdown Compiler for Blogs & Project Documentation

**Docmach** is a **Markdown-powered** static site generator designed for **modern blogs and project documentation**. It integrates **the simplicity of Markdown and Tailwind CSS** to generate sites with minimal effort.

## Why Choose Docmach

- **Markdown-First** – Write Markdown, and let Docmach handle the rest
- **Tailwind CSS Integration** – Built-in Tailwind CSS compiler for beautiful, responsive designs
- **Ultra-Fast Builds** – Optimized for speed and performance
- **Custom Themes** – Choose from available themes or create your own
- **Live Reload & Watch Mode** – Instant preview while editing your content

## Get Started

```sh
# Install globally
npm i -g docmach

# Create a new project
mkdir my-blog
cd my-blog
docmach
```

## Or just build a single md file

```js
import Docmach from "docmach";

await Docmach(file);
```
This assumes the file exists in the docs folder.
So, that why you can programmatically use this for a blog engine.
You can write the file to s3 then the docs folder. then call ```Docmach(file);```
Then configure Nginx to sever your build folder.

## How Docmach Works

Docmach parses all .md files in your input folder, extracting and processing Markdown and HTML content. It uses special Docmach tag to apply templates and functions.

### Docmach Tag

Docmach tags work similarly to HTML tags:

```html
<docmach 
type="fragment" 
file="template.html" 
params="title=My Page; author=JohnDoe" 
/>

<!-- Function parameters example -->
<docmach 
type="function" 
file="author-bio.js" 
params="title=My Page; author={name: JohnDoe, age: 24, date: 20th March 2015}" 
/>
```

## Using Fragment Templates

Fragment templates allow you to create reusable HTML components:

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

## Using Function Templates

Function templates enable dynamic content generation:

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
   `
}
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

## About Docmach

- **Markdown-Powered, But Smarter** – Understands context and allows nested Markdown inside HTML elements
- **Tailwind, But on Your Terms** – Not forced into Tailwind, but intelligently processes styles if enabled
- **Live Reload That Actually Works** – Watch mode ensures smooth development experience even with large projects
- **Optimized Typography** – Applies optimized typography settings for professional and polished content
- **Intelligent Asset Handling** – Automatically copies, optimizes, and references assets
- **Code Highlighting** – Uses highlight.js with custom themes for readable code snippets
- **CLI That Doesn't Get in Your Way** – Zero-config mode by default with options for power users
- **Fast, Even at Scale** – Batch processes file changes to avoid unnecessary rebuilds
- **SEO & Accessibility Built-In** – Generates clean, semantic HTML optimized for search engines

Designed to be focused on **speed, developer experience, and flexibility**.

<docmach type="function" file="fragments/doc-nav.js" 
params="prev: {link: /, text: Get started }; next: {link: /docs/quickstart.html, text: Quickstart };" 
/> 
<docmach type="fragment" file="fragments/doc-sidebar-end.html" />
<docmach type="fragment" file="fragments/footer.html" />