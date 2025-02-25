<!-- @credence-[/index.html]-[Credence] -->

# Credence - markdown compiler for blogs & project Documentation 🚀  

**Credence** is a  **Markdown-powered** static site generator designed for **modern blogs and project documentation**. It combines **the simplicity of Markdown, the power of Tailwind CSS, and a flexible build system** to deliver stunning, high-performance sites with minimal effort.  

## **Why Choose Credence?**  

✅ **Markdown-First** – Write content in Markdown, and let Credence handle the rest.  
✅ **Tailwind CSS Integration** – Get beautiful, responsive layouts out of the box.  
✅ **Ultra-Fast Builds** – Optimized for speed, efficiency, and low overhead.  
✅ **Pluggable UI** – Use Tailwind, CSS, or custom themes—**your choice**.  
✅ **Live Reload & Watch Mode** – Instant preview while editing.  
✅ **SEO-Optimized** – Clean, accessible, and search-engine friendly.  
✅ **Dev-Friendly Syntax Highlighting** – Custom **highlight.js** themes for code blocks.

### **The Vision**  

Credence is built to **super easy and fast**. Whether you're documenting a project, writing a technical blog, or building a knowledge base— Credence makes it effortless.  

### **Get Started**  

```sh
npm i -g credence
cd my-blog
credence
```

📖 **Docs:** [credence.dev](https://github.com/CodeDynasty-foo/credence)  

**Build. Document. Publish.** The **Credence way.** 🚀

### Using comments

```markdown
/*@credence-[/index.html]-[Credence]

### first clone the repo
  git clone credence
  ### running build command
  npm run build
*/
```

### Using md files

```markdown
<!-- @credence-[/docs.html]-[documentation] -->

# Credence Command-Line Interface (CLI) Documentation

The **Credence CLI** is a robust tool designed to streamline and automate tasks associated with the Credence application suite. This document details its installation, usage, available commands, and developer guidelines.

## Table of Contents
*/
```

### **About credence 🚀**  

1. **Markdown-Powered, But Smarter** 📝  
   - Unlike most static site generators, **Credence** doesn't just convert Markdown to HTML—it **understands context**.  
   - It allows **nested Markdown inside HTML elements**, solving limitations seen in other generators like Hugo and Docusaurus.  

2. **Tailwind, But on Your Terms** 🎨  
   - You’re not **forced** into Tailwind, but if you enable it, **Credence intelligently processes styles** while avoiding unnecessary bloat.  
   - It scans **Markdown, HTML, and even component files** to ensure only the needed styles make it into your final build.  

3. **Live Reload That Actually Works** 🔄  
   - Credence’s **watch mode** goes beyond just reloading pages—it can **retry connections**, detect stale caches, and ensure that **your development experience is smooth** even when working with large projects.  

4. **No More Ugly Typography** 🎭  
   - By default, **Credence applies optimized typography settings** so Markdown-based content looks **professional and polished** right out of the box.  
   - No need for **extra CSS** just to make text readable like in other generators.  

5. **Intelligent Asset Handling** 📦  
   - Automatically **copies, optimizes, and references assets** like images, fonts, and stylesheets, ensuring they’re efficiently bundled.  
   - Works even when running in a serverless environment or blob storage.  

6. **Code Highlighting That Feels Right** 💻  
   - Uses **highlight.js with custom themes**, ensuring code snippets are **visually pleasing and readable**.  

7. **CLI That Doesn’t Get in Your Way** 🛠️  
   - Runs in **zero-config mode** by default but lets **power users tweak every aspect** via an easy-to-use CLI.  
   - Supports **auto-detection of project structures**, so **you don’t have to manually set up folders** every time.  

8. **Fast, Even at Scale** ⚡  
   - **Batch processes file changes** to avoid unnecessary rebuilds.  
   - Can **handle thousands of Markdown files** without slowing down, making it a solid choice for **large-scale documentation**.  

9. **SEO & Accessibility Built-In** 🌍  
   - Generates **clean, semantic HTML** optimized for search engines.  

> Designed to be focused on **speed, developer experience, and flexibility**.  

![img](https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80)
