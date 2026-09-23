/*
 * Docmach plugin system
 *
 * Plugins extend the build pipeline through hooks. Hooks receive structured
 * data (config, page metadata, generated html) instead of raw tag strings,
 * so plugins stay stable as the compiler evolves.
 */
import { dirname, isAbsolute, join } from "node:path";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { cwd } from "node:process";
import type { configType } from "./parser.ts";
import type { DocmachTagMetadata, PageMetadata } from "./compiler.ts";

export type PluginOptions = Record<string, unknown>;

// A plugin is referenced by module path, installed package name, or
// "docmach:name" for the official plugins bundled with Docmach.
export type PluginReference = string | { path: string; options?: PluginOptions };

export type BuildContext = {
  config: configType;
};

export type PostBuildContext = BuildContext & {
  pages: PageMetadata[];
};

export type PageContext = {
  sourcePath: string; // relative to the project root, e.g. "docs/blog/post.md"
  outputPath: string; // relative to the project root, e.g. "docmach/blog/post.html"
  link: string; // url path, e.g. "/blog/post.html"
  docmachTags: DocmachTagMetadata[];
  html: string;
};

export type PluginHooks = {
  // Runs once per full build, before files are discovered.
  preBuild?: (context: BuildContext) => void | Promise<void>;
  // Runs per page, before the html is written. Return a string to replace it.
  transformHtml?: (page: PageContext) => string | void | Promise<string | void>;
  // Runs per page, after the html is written.
  page?: (page: PageContext) => void | Promise<void>;
  // Runs once per full build, after the manifest and sitemap are written.
  postBuild?: (context: PostBuildContext) => void | Promise<void>;
};

export type DocmachPlugin = {
  name: string;
  hooks: PluginHooks;
};

export type DocmachPluginFactory = (
  options: PluginOptions,
) => DocmachPlugin | Promise<DocmachPlugin>;

class PluginManager {
  private loaded = new Map<string, DocmachPlugin>();
  private reported = new Set<string>();

  list(): string[] {
    return [...this.loaded.values()].map((plugin) => plugin.name);
  }

  async load(
    references: PluginReference | PluginReference[] = [],
    base = cwd(),
  ): Promise<void> {
    // a hand written config can hold anything, never let a bad entry break a build
    const list = Array.isArray(references) ? references : [references];
    for (const reference of list) {
      if (
        reference === null ||
        (typeof reference !== "string" && typeof reference !== "object")
      ) {
        console.warn(
          `Docmach: ignoring invalid plugin reference "${String(reference)}".`,
        );
        continue;
      }
      const path = typeof reference === "string" ? reference : reference.path;
      const options = typeof reference === "string"
        ? {}
        : reference.options ?? {};
      if (typeof path !== "string" || !path) {
        console.warn('Docmach: ignoring a plugin reference without a "path".');
        continue;
      }
      try {
        // deduplicate by resolved url so "./plugins/x.js" and its absolute
        // path never load the same plugin twice
        const url = this.resolve(path, base);
        if (this.loaded.has(url)) continue;
        const module = await import(url);
        const entry = module.default ?? module;
        // A plugin is either { name, hooks } or a factory returning one.
        const plugin = typeof entry === "function" ? await entry(options) : entry;
        if (!plugin || typeof plugin.name !== "string") {
          throw new Error(
            "a plugin must export { name, hooks } or a factory returning one",
          );
        }
        if (!plugin.hooks) {
          console.warn(`Docmach: plugin "${plugin.name}" has no hooks.`);
        }
        this.loaded.set(url, { name: plugin.name, hooks: plugin.hooks ?? {} });
      } catch (error) {
        console.error(`Docmach: failed to load plugin "${path}":`, error);
      }
    }
  }

  async runPreBuild(context: BuildContext): Promise<void> {
    await this.run("preBuild", context);
  }

  async runPostBuild(context: PostBuildContext): Promise<void> {
    await this.run("postBuild", context);
  }

  async runPage(page: PageContext): Promise<void> {
    await this.run("page", page);
  }

  async runTransformHtml(page: PageContext): Promise<string> {
    let html = page.html;
    for (const plugin of this.loaded.values()) {
      const hook = plugin.hooks.transformHtml;
      if (typeof hook !== "function") continue;
      try {
        const result = await hook({ ...page, html });
        if (typeof result === "string") html = result;
      } catch (error) {
        this.report(plugin, "transformHtml", error);
      }
    }
    return html;
  }

  private async run(
    hook: "preBuild" | "postBuild" | "page",
    context: BuildContext | PostBuildContext | PageContext,
  ): Promise<void> {
    for (const plugin of this.loaded.values()) {
      const callback = plugin.hooks[hook] as
        | ((context: BuildContext | PostBuildContext | PageContext) => unknown)
        | undefined;
      if (typeof callback !== "function") continue;
      try {
        await callback(context);
      } catch (error) {
        this.report(plugin, hook, error);
      }
    }
  }

  // Errors are reported once per hook so incremental builds stay readable
  private report(plugin: DocmachPlugin, hook: string, error: unknown) {
    const key = `${plugin.name}:${hook}`;
    if (this.reported.has(key)) return;
    this.reported.add(key);
    console.error(`Docmach: plugin "${plugin.name}" failed in ${hook}:`, error);
  }

  private resolve(path: string, base: string): string {
    // official plugins bundled with Docmach: "docmach:rss"
    if (path.startsWith("docmach:")) {
      const file = fileURLToPath(
        new URL(
          `../plugins/${path.slice("docmach:".length)}.js`,
          import.meta.url,
        ),
      );
      return this.toUrl(file);
    }
    if (path.startsWith(".") || isAbsolute(path)) {
      return this.toUrl(isAbsolute(path) ? path : join(base, path));
    }
    // installed package: resolve from the user's project, not from Docmach
    return this.toUrl(this.resolvePackage(path, base));
  }

  // Canonical file url, so two spellings of the same file (e.g. "/tmp" and
  // its real path "/private/tmp" on macOS) still load the plugin once
  private toUrl(file: string): string {
    try {
      return pathToFileURL(realpathSync(file)).href;
    } catch (_e) {
      // missing file, let the import report it
      return pathToFileURL(file).href;
    }
  }

  // require.resolve cannot see ESM-only packages (`exports` with no
  // require/default condition), so fall back to reading the entry by hand
  private resolvePackage(path: string, base: string): string {
    const require = createRequire(join(base, "package.json"));
    try {
      return require.resolve(path);
    } catch (error) {
      const manual = this.resolveEsmPackage(path, base);
      if (!manual) throw error;
      return manual;
    }
  }

  // Walk up node_modules to find the package directory
  private resolveEsmPackage(name: string, base: string): string | undefined {
    const parts = name.split("/");
    const packageName = name.startsWith("@")
      ? parts.slice(0, 2).join("/")
      : parts[0];
    const subpath = "." + name.slice(packageName.length);
    let dir = base;
    while (true) {
      const packageDir = join(dir, "node_modules", packageName);
      if (existsSync(join(packageDir, "package.json"))) {
        try {
          const pkg = JSON.parse(
            readFileSync(join(packageDir, "package.json"), "utf8"),
          );
          const entry = this.pickExport(pkg.exports, subpath) ??
            pkg.module ?? pkg.main;
          if (typeof entry === "string") return join(packageDir, entry);
        } catch (_e) {
          // unreadable package.json, report the original resolve error
        }
        return undefined;
      }
      const parent = dirname(dir);
      if (parent === dir) return undefined;
      dir = parent;
    }
  }

  // Pick the entry an ESM import would use: subpath maps, condition objects,
  // and plain string exports
  private pickExport(
    exportsField: unknown,
    subpath: string,
  ): string | undefined {
    if (typeof exportsField === "string") {
      return subpath === "." ? exportsField : undefined;
    }
    if (Array.isArray(exportsField)) {
      for (const value of exportsField) {
        const picked = this.pickExport(value, subpath);
        if (picked) return picked;
      }
      return undefined;
    }
    if (!exportsField || typeof exportsField !== "object") return undefined;
    const entries = exportsField as Record<string, unknown>;
    // a map of subpaths, e.g. { ".": "./index.js", "./cli": "./cli.js" }
    if (Object.keys(entries).some((key) => key.startsWith("."))) {
      return this.pickExport(entries[subpath], subpath);
    }
    // a condition object, e.g. { import: "./index.js", default: "./index.js" }
    for (const condition of ["import", "default", "require", "module", "node"]) {
      const picked = this.pickExport(entries[condition], subpath);
      if (picked) return picked;
    }
    return undefined;
  }
}

export const plugins = new PluginManager();
