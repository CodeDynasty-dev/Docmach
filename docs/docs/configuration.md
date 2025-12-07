<docmach type="fragment" file="fragments/head.html" params="title: Docmach Quickstart" />
<docmach type="fragment" file="fragments/doc-sidebar.html"   />

# Configuration

Docmach is configured via the `docmach` key in your `package.json` file.

## Basic Configuration

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "docmach": {
    "docs-directory": "docs",
    "build-directory": "docmach",
    "assets-folder": "assets"
  }
}
```

## Configuration Options

### docs-directory

**Type:** `string`  
**Default:** `"."` (project root)

The directory containing your Markdown source files.

```json
"docs-directory": "docs"
```

**Examples:**

- `"docs"` - Use `docs/` folder
- `"content"` - Use `content/` folder
- `"."` - Use project root
- `"src/pages"` - Nested directory

### build-directory

**Type:** `string`  
**Default:** `"./docmach"`

The output directory where generated HTML files will be placed.

```json
"build-directory": "docmach"
```

**Examples:**

- `"docmach"` - Output to `docmach/`
- `"dist"` - Output to `dist/`
- `"public"` - Output to `public/`
- `"build/site"` - Nested output directory

**Note:** This directory is cleaned on each build.

### assets-folder

**Type:** `string`  
**Default:** `""` (none)

Directory containing static assets (images, CSS, JS, fonts) to copy to the build directory.

```json
"assets-folder": "assets"
```

**Examples:**

- `"assets"` - Copy from `assets/`
- `"static"` - Copy from `static/`
- `"public"` - Copy from `public/`

**Behavior:**

- All files are copied to the root of the build directory
- Only changed files are copied (incremental)
- Directory structure is preserved

## Complete Example

```json
{
  "name": "my-documentation",
  "version": "1.0.0",
  "description": "Project documentation",
  "scripts": {
    "dev": "docmach",
    "build": "docmach build",
    "preview": "docmach print"
  },
  "docmach": {
    "docs-directory": "docs",
    "build-directory": "dist",
    "assets-folder": "static"
  },
  "devDependencies": {
    "docmach": "^1.0.20"
  }
}
```

## Directory Structure

Recommended project structure:

```
my-project/
├── docs/                    # Markdown source files
│   ├── index.md
│   ├── getting-started.md
│   └── docs/
│       ├── api.md
│       └── guides.md
├── fragments/               # Reusable templates
│   ├── head.html
│   ├── footer.html
│   └── nav.js
├── static/                  # Static assets
│   ├── images/
│   ├── styles.css
│   └── favicon.ico
├── dist/                    # Generated output (gitignored)
├── package.json             # Config here
└── tailwind.config.js       # Optional Tailwind config
```

## Environment-Specific Configuration

While Docmach doesn't natively support environment variables yet, you can use different configs:

**Development:**

```json
"docmach": {
  "docs-directory": "docs",
  "build-directory": "dev-build",
  "assets-folder": "assets"
}
```

**Production:**

```json
"docmach": {
  "docs-directory": "docs",
  "build-directory": "dist",
  "assets-folder": "assets"
}
```

## Validation

Docmach validates your configuration on startup:

- Warns if `docs-directory` doesn't exist
- Creates `build-directory` if it doesn't exist
- Skips asset copying if `assets-folder` is empty or doesn't exist

## Future Configuration Options

See [ROADMAP.md](../../ROADMAP.md) for planned configuration enhancements:

- Multiple config file formats (`.js`, `.ts`)
- Environment variable overrides
- Per-page frontmatter configuration
- Plugin configuration
- Build optimization settings

<docmach type="fragment" file="fragments/doc-sidebar-end.html"   />
<docmach type="fragment" file="fragments/footer.html" />
