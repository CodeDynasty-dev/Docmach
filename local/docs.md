<!-- @credence-[/docs.html]-[documentation] -->

# Credence Command-Line Interface (CLI) Documentation

The **Credence CLI** is a robust tool designed to streamline and automate tasks associated with the Credence application suite. This document details its installation, usage, available commands, and developer guidelines.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Available Commands](#available-commands)
   - [App Builder](#app-builder)
   - [Macro](#macro)
   - [Patch Management](#patch-management)
     - [Standard Patch](#standard-patch)
     - [Docker Patch](#docker-patch)
   - [Template Handling](#template-handling)
   - [Pages Management](#pages-management)
   - [Metabase Integration](#metabase-integration)
4. [Developer Guidelines](#developer-guidelines)
   - [Template Development](#template-development)
   - [Patch Development](#patch-development)
5. [Changelog](#changelog)
6. [FAQ](#faq)

## Installation

Before installing the Credence CLI, ensure your system meets these prerequisites:

- **Node.js:** Version 14 or higher is required. Download from [nodejs.org](https://nodejs.org/).
- **Oracle Instant Client:** Version 19.9 or higher (if applicable). Download from [Oracle](https://www.oracle.com/database/technologies/instant-client.html).

Install the CLI globally using npm:

```sh
npm install -g credence-cli
```

## Basic Usage

After installation, run the CLI using the `credence` command in your terminal:

```sh
credence <command> [options]
```

For a list of available commands and options, run:

```sh
credence --help
```

## Available Commands

### App Builder

Use the App Builder command to scaffold new applications using predefined templates:

```sh
credence app create <app-name>
```

### Macro

Execute reusable code snippets or configurations with the Macro command:

```sh
credence macro run <macro-name>
```

### Patch Management

Manage patches for your application with these commands:

#### Standard Patch

Generate a standard patch to update your application:

```sh
credence patch generate --standard
```

#### Docker Patch

Create a patch optimized for Docker deployments:

```sh
credence patch generate --docker
```

### Template Handling

Manage HTML and Markdown templates used for generating pages:

```sh
credence template list
credence template apply <template-name> <target-file>
```

### Pages Management

Extract and generate pages based on content files that include special `@credence` markers:

```sh
credence pages extract
credence pages generate
```

### Metabase Integration

Integrate and manage Metabase configurations for data visualization:

```sh
credence metabase sync
```

## Developer Guidelines

### Template Development

- Place your template files in the `/templates` directory.
- Use the appropriate placeholders for dynamic content.
- Validate templates by running:

  ```sh
  credence template test
  ```

### Patch Development

When developing patches, follow these guidelines:

- **General Guidelines:**
  - Always run tests after applying a patch.
  - Backup your configuration files before generating new patches.

- **Database Scripts:**
  - Ensure scripts are idempotent and well-documented.

- **Manual Scripts:**
  - Provide clear instructions within the generated patch documentation.

## Changelog

Maintain a detailed changelog that documents:

- New features
- Bug fixes
- Performance improvements
- Breaking changes

Check the [CHANGELOG.md](CHANGELOG.md) for complete details.

## FAQ

**Q:** How do I report an issue?  
**A:** Report issues on our [GitHub repository](https://github.com/yourrepo/credence-cli/issues).

**Q:** Can I contribute to the Credence CLI?  
**A:** Absolutely! Please refer to our [contribution guidelines](CONTRIBUTING.md).

---
**This documentation is part of the Credence CLI repository. For the latest updates, see our [release notes](CHANGELOG.md).**
