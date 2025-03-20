# Docmach

**Docmach** is a **Markdown-powered** static site generator designed for **modern blogs and project documentation**. It integrates **the simplicity of Markdown and Tailwind CSS** to generate sites with minimal effort.

## Features

- **Markdown Compilation** – Write Markdown, and let Docmach handle the rest
- **Tailwind CSS Integration** – Built-in Tailwind CSS compiler for beautiful, responsive designs
- **Custom Themes** – Choose from available themes or create your own
- **Live Reload & Watch Mode** – Instant preview while editing your content
- **Performance Optimized** – Fast build times and optimized output
- **Simple Configuration** – Minimal setup required to get started

[See more](https://docmach.codedynasty.dev/)

##  Installation

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

| Option | Description | Default |
|--------|-------------|---------|
| **docs-directory** | Directory containing your Markdown files | Root directory |
| **build-directory** | Output directory for the generated site | `./docmach` |
| **assets-folder** | Directory with assets to be copied to output | None |

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
```


### Using Function tags
```js
// in author-bio.js
export default function (title,author) {
   return `
   <div>
   <h1>by ${title}</h1>
   <h3>by ${author.name}</h3>
   <p>Aged: ${author.age}</p>
   <p>On: ${author.date}</p>
   </div>
   `
}
   // such functions should do it works fast please.
```

### Docmach Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| **type** | string | Template type: `"fragment"` or `"function"` |
| **file** | string | Location of template code: `.html` for fragments or `.js` for functions |
| **params** | string | Parameters passed to templates as `{{ key }}` in HTML fragments or as function parameters |
 
## Why Choose Docmach?

- **Live Reload That Actually Works** 🔄 – See changes instantly
- **CLI That Doesn't Get in Your Way** 🛠️ – Simple, intuitive commands
- **Developer Experience Focused** 🌟 – Built with modern web development workflows in mind
- **Flexible & Extensible** 🧩 – Adapt to your project needs without complexity

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT