/*
 * Docmach plugin system
 *
 * Plugins extend the build pipeline through hooks. Hooks receive structured
 * data (config, page metadata, generated html) instead of raw tag strings,
 * so plugins stay stable as the compiler evolves.
 */
import { isAbsolute, join } from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
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

export type DocmachPluginFactory = (options: PluginOptions) => DocmachPlugin;

class PluginManager {
  private loaded = new Map<string, DocmachPlugin>();
  private reported = new Set<string>();

  list(): string[] {
    return [...this.loaded.values()].map((plugin) => plugin.name);
  }

  async load(references: PluginReference[] = [], base = cwd()): Promise<void> {
    for (const reference of references) {
      const path = typeof reference === "string" ? reference : reference.path;
      const options = typeof reference === "string"
        ? {}
        : reference.options ?? {};
      if (!path || this.loaded.has(path)) continue;
      try {
        const module = await import(this.resolve(path, base));
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
        this.loaded.set(path, { name: plugin.name, hooks: plugin.hooks ?? {} });
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
      return new URL(
        `../plugins/${path.slice("docmach:".length)}.js`,
        import.meta.url,
      ).href;
    }
    if (path.startsWith(".") || isAbsolute(path)) {
      return pathToFileURL(isAbsolute(path) ? path : join(base, path)).href;
    }
    // installed package: resolve from the user's project, not from Docmach
    const require = createRequire(join(base, "package.json"));
    return pathToFileURL(require.resolve(path)).href;
  }
}

export const plugins = new PluginManager();
