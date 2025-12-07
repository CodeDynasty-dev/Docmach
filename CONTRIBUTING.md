# Contributing to Docmach

Thank you for your interest in contributing to Docmach! This guide will help you get started.

## Code of Conduct

Be respectful, inclusive, and constructive. We're building a welcoming community.

## Getting Started

### Prerequisites

- Node.js >= 14.0.0 or Bun >= 0.1.0
- Git
- TypeScript knowledge

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/CodeDynasty-dev/Docmach.git
cd Docmach

# Install dependencies
npm install

# Watch TypeScript files
npm run watch

# In another terminal, run dev server
npm run dev
```

## Project Structure

```
src/
├── index.ts      # CLI entry point, dev server, file watcher
├── parser.ts     # File discovery, build pipeline
├── compiler.ts   # Markdown compilation, tag processing
└── print.ts      # Build output utilities

docs/             # Documentation source (Markdown)
fragments/        # Reusable HTML templates and JS functions
assets/           # Static assets
docmach/          # Generated output (gitignored)
dist/             # Compiled TypeScript (gitignored)
```

## Development Workflow

### Making Changes

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic

3. **Test your changes**

   ```bash
   # Compile TypeScript
   npm run compile

   # Test the CLI
   npx docmach build

   # Test dev server
   npx docmach
   ```

4. **Check for errors**

   ```bash
   # TypeScript compilation
   npm run watch

   # Look for type errors
   ```

### Code Style

- **TypeScript:** Use strict mode, explicit types where helpful
- **Naming:** camelCase for variables/functions, PascalCase for classes
- **Imports:** Group by native, packages, then local files
- **Comments:** Explain "why", not "what"

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add plugin system for extensibility
fix: resolve template caching issue
docs: update API reference with examples
refactor: simplify parameter parsing logic
perf: optimize file watching with throttling
```

**Format:** `type: description`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

## Areas to Contribute

### High Priority

1. **Plugin System** - Enable third-party extensions
2. **Frontmatter Support** - Parse YAML/TOML metadata
3. **Performance** - Parallel processing, better caching
4. **Testing** - Unit and integration tests
5. **Documentation** - More examples and guides

### Good First Issues

Look for issues labeled `good-first-issue`:

- Documentation improvements
- Example sites and templates
- Bug fixes with clear reproduction steps
- Small feature additions

### Feature Requests

Before implementing a new feature:

1. Check if an issue exists
2. Create a discussion/issue to gather feedback
3. Wait for maintainer approval
4. Implement with tests and documentation

## Testing

### Manual Testing

```bash
# Build the project
npm run compile

# Test on example docs
npx docmach build

# Check generated output
ls -la docmach/

# Verify manifest
cat docmach/docmach-manifest.json
```

### Test Checklist

- [ ] TypeScript compiles without errors
- [ ] Dev server starts and serves files
- [ ] Live reload works
- [ ] Build command generates correct output
- [ ] Manifest includes all pages
- [ ] Assets are copied correctly
- [ ] Tailwind CSS compiles
- [ ] All docmach tags work (fragment, function, wrapper)

## Documentation

### Writing Documentation

- Use clear, concise language
- Include code examples
- Add use cases and best practices
- Test all code snippets

### Documentation Structure

```
docs/docs/
├── introduction.md      # Overview and getting started
├── quickstart.md        # Quick setup guide
├── configuration.md     # Config options
├── advanced-features.md # Advanced usage
└── api-reference.md     # Complete API docs
```

## Pull Request Process

1. **Update documentation** if you changed functionality
2. **Add examples** for new features
3. **Test thoroughly** on different scenarios
4. **Update CHANGELOG.md** with your changes
5. **Submit PR** with clear description

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How did you test this?

## Checklist

- [ ] Code compiles without errors
- [ ] Documentation updated
- [ ] Examples added
- [ ] Tested manually
```

## Release Process

Maintainers handle releases:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Publish to npm
5. Create GitHub release

## Getting Help

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions and ideas
- **Discord:** Real-time chat (coming soon)

## Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the Apache License.

---

Thank you for contributing to Docmach! 🚀
