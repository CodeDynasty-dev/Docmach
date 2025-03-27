<docmach type="fragment" file="fragments/head.html" params="title: introduction"/>

<docmach type="wrapper" replacement="replacement" file="fragments/post-wrapper.html">
<h1>Nice h1 tag</h1>

# The Markdown-Powered Static Site Generator You Actually Want to Use

**TL;DR**: Docmach is a fast static site generator that lets you write Markdown and get static sites with little config and less effort. It has built-in Tailwind CSS support, live reload, and custom templates that don't get in your way.

## The Problem with Existing Static Site Generators

We've all been there. You want to create a simple blog or documentation site. You try the popular options:

- **Docusaurus**: Configuration hell for basic customization
- **Jekyll**: Ruby dependencies break on update
- **Hugo**: Complex templating language you have to learn
- **Gatsby/Next.js**: Overkill React setup for simple content

They all solve 80% of the problem but leave you fighting with the last 20%.

## Enter Docmach

**Docmach** is a Markdown-powered static site generator designed for modern blogs and project documentation. It integrates the simplicity of Markdown and Tailwind CSS to generate sites with minimal effort.

What makes it different?

## 1. Markdown-First, But Actually Usable

Docmach doesn't just convert Markdown to HTML—it understands context. You can use Docmach tags that work just like HTML:

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

This means you can mix Markdown with templates, functions, and components—without the mess of custom syntax.

## 2. Tailwind CSS That Just Works

Tailwind CSS is built-in, but not forced. Want to use it? Great. Don't want to? That's fine too. 

Docmach handles the compilation, optimization, and integration automatically. No need for complex PostCSS setups or fighting with purging.

## 3. Live Reload That Doesn't Break

The most frustrating part of many static site generators is the broken live reload. Docmach's watch mode goes beyond just refreshing the page—it can retry connections, detect stale caches, and ensure your development experience stays smooth.

## 4. Two-Minute Setup

Get started in seconds:

```bash
# Install
npm i docmach -g

# Create project & start
mkdir my-docs
cd my-docs
docmach
```

No boilerplate, no starter templates to clone, no 15-step process. Just install and run.

## 5. Nothing is less simple

Docmach offers two simple but powerful templating options:

### Fragment Templates (HTML with variables)

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

### Function Templates (JavaScript power)

```js
// author-bio.js
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

No weird custom templating languages to learn. Just HTML and JavaScript.

## Why Switch to Docmach

- **Speed**: Optimized for fast builds, even with thousands of Markdown files
- **Developer Experience**: The CLI doesn't get in your way
- **Flexibility**: Supports both simple blogs and complex documentation
- **No Lock-in**: Your content stays as Markdown files you can move anywhere
- **Clean Output**: Generates semantic HTML optimized for SEO

## Try It Now

```bash
npm i docmach -g
docmach
```

Docmach is focused on speed, developer experience, and flexibility. It's the static site generator I wish existed years ago, so I built it.

Give it a try and let me know what you think in the comments!

> Docmach might not be feature-rich as others but it gets simple things done in no time.
> Drop your feedback for future improvements in the issues.
---

*What static site generator pain points have you experienced? Are you looking for something simpler but still powerful?*

</docmach>

<docmach type="fragment" file="fragments/footer.html" />