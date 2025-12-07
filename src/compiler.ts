import { existsSync } from "fs";
import { resolve } from "path";
import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import { readFile } from "fs/promises";
import { normalizePath } from "./parser";

const md = new MarkdownIt({
  html: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return "";
  },
});

class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    this.cache = new Map<K, V>();
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Move to end to mark as recently used
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // just update the value and move to end
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // evict the least recently used item
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
}

export const templateCache = new LRUCache<
  string,
  {
    content: any;
    dependentMDs: Set<string>;
  }
>();

// Helper: Parse attributes string into a key/value object.
function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  // Matches attributes of the form key="value"
  const attrPattern = /(\w+)\s*=\s*"([^"]*?)"/g;
  let match;
  while ((match = attrPattern.exec(attrString)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function parseParams(
  paramsStr: string
): Record<string, string | number | object> {
  const params: Record<string, string | number | object> = {};
  const regex = /(\w+):\s*(\{[^}]*\}|\S[^;]*)/g; // Match full objects or single values
  let match;

  while ((match = regex.exec(paramsStr)) !== null) {
    let key = match[1].trim();
    let value: any = match[2].trim();

    // If the value starts with `{`, parse as an object
    if (value.startsWith("{") && value.endsWith("}")) {
      try {
        const objectEntries = value
          .slice(1, -1) // Remove outer `{}`
          .split(/,\s?(?=\w+:)/) // Split by `;` but only at key-value boundaries
          .map((pair: string) => {
            const [k, ...vParts] = pair.split(":").map((s) => s.trim());
            const v = vParts.join(":"); // Preserve `http://` in values
            return [k, isNaN(Number(v)) ? v : Number(v)];
          });

        value = Object.fromEntries(objectEntries);
      } catch (error) {
        console.error("Error parsing object parameters:", error);
      }
    } else {
      value = isNaN(Number(value)) ? value : Number(value);
    }

    params[key] = value;
  }

  return params;
}

async function processWrapperTags(fileContent: string, filePath: string) {
  const replacements: { original: string; replacement: string }[] = [];
  const wrapperRegex = /<docmach\b([^>]*?)\s*([^/])>([\s\S]*?)<\/docmach>/g;

  const matches = [...fileContent.matchAll(wrapperRegex)];
  const templatePaths = new Set<string>();

  for (const match of matches) {
    const attrStr = match[1].endsWith('"') ? match[1] : match[1] + '"';
    const attrs = parseAttributes(attrStr);
    if (attrs["type"] === "wrapper" && attrs["file"]) {
      templatePaths.add(resolve(attrs["file"]));
    }
  }

  const loadedTemplates = new Map<string, string>();
  const readPromises = [...templatePaths].map(async (resolvedPath) => {
    if (templateCache.has(resolvedPath)) {
      loadedTemplates.set(
        resolvedPath,
        templateCache.get(resolvedPath)!.content
      );
      return;
    }
    try {
      const fragmentContent = await readFile(
        normalizePath(resolvedPath),
        "utf8"
      );
      loadedTemplates.set(resolvedPath, fragmentContent);
      const frag = {
        content: fragmentContent,
        dependentMDs: new Set<string>([filePath]),
      };
      templateCache.set(resolvedPath, frag);
    } catch (error) {
      console.error("Error reading template file:", resolvedPath, error);
    }
  });

  await Promise.all(readPromises);

  for (const match of matches) {
    const fullMatch = match[0];
    const attrStr = match[1].endsWith('"') ? match[1] : match[1] + '"';
    let innerContent = match[3].trim();
    const attrs = parseAttributes(attrStr);
    if (attrs["type"] === "wrapper" && attrs["file"] && attrs["replacement"]) {
      const resolvedPath = resolve(attrs["file"]);
      let templateContent = loadedTemplates.get(resolvedPath);
      if (templateContent) {
        const params = attrs["params"] ? parseParams(attrs["params"]) : {};
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            templateContent = templateContent!.replace(
              new RegExp(`{{\\s*${key}\\s*}}`, "g"),
              String(value)
            );
          });
        }
        innerContent = md.render(innerContent);
        const replaced = templateContent.replace(
          new RegExp(`{{\\s*${attrs["replacement"]}\\s*}}`),
          innerContent
        );
        replacements.push({ original: fullMatch, replacement: replaced });
      }
    } else {
      if (!attrs["replacement"]) {
        console.error(
          "Docmach: a wrapper tag must have a replacement attribute!"
        );
      }
    }
  }
  return replacements;
}

async function processSelfClosingTags(fileContent: string, filePath: string) {
  const tagRegex = /<docmach([^>]+)\/?\>/g;

  const replacements: { original: string; replacement: string }[] = [];
  const matches = [...fileContent.matchAll(tagRegex)];
  const functionPaths = new Set<string>();

  for (const match of matches) {
    const attributes = parseAttributes(match[1]);
    if (attributes["type"] === "function" && attributes["file"]) {
      functionPaths.add(resolve(attributes["file"]));
    }
  }

  const loadedFunctions = new Map<string, any>();
  const importPromises = [...functionPaths].map(async (resolvedPath) => {
    if (templateCache.has(resolvedPath)) {
      loadedFunctions.set(
        resolvedPath,
        templateCache.get(resolvedPath)!.content
      );
      return;
    }
    try {
      const module = await import(resolvedPath);
      if (typeof module.default !== "function") {
        console.error(`Docmach: No default function export in ${resolvedPath}`);
        return;
      }
      loadedFunctions.set(resolvedPath, module);
      const frag = {
        content: module,
        dependentMDs: new Set<string>([filePath]),
      };
      templateCache.set(resolvedPath, frag);
    } catch (err) {
      console.error(`Error executing function ${resolvedPath}:`, err);
    }
  });

  await Promise.all(importPromises);

  for (const match of matches) {
    const tagFull = match[0];
    const attributes = parseAttributes(match[1]);
    const { file, type } = attributes;
    if (!file || !type) continue;

    const params = attributes["params"]
      ? parseParams(attributes["params"])
      : {};
    const resolvedPath = resolve(file);

    if (type === "function") {
      const module = loadedFunctions.get(resolvedPath);
      if (module) {
        const result = await module.default(params || {});
        replacements.push({ original: tagFull, replacement: String(result) });
      }
    }

    if (type === "fragment") {
      if (!existsSync(normalizePath(resolvedPath))) {
        console.error(`Docmach: Fragment file not found: ${resolvedPath}`);
        continue;
      }
      let fragmentContent: string;
      if (templateCache.has(resolvedPath)) {
        const frag = templateCache.get(resolvedPath)!;
        frag.dependentMDs.add(filePath);
        fragmentContent = frag.content;
        templateCache.set(resolvedPath, frag);
      } else {
        fragmentContent = await readFile(normalizePath(resolvedPath), "utf8");
        const frag = {
          content: fragmentContent,
          dependentMDs: new Set<string>(),
        };
        frag.dependentMDs.add(filePath);
        templateCache.set(resolvedPath, frag);
      }
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          fragmentContent = fragmentContent.replace(
            new RegExp(`{{\\s*${key}\\s*}}`, "g"),
            String(value)
          );
        });
      }
      replacements.push({ original: tagFull, replacement: fragmentContent });
    }
  }
  return replacements;
}

export interface DocmachTagMetadata {
  type: string;
  file?: string;
  params?: Record<string, string | number | object>;
  replacement?: string;
}

export interface PageMetadata {
  sourcePath: string;
  outputPath: string;
  link: string;
  docmachTags: DocmachTagMetadata[];
}

export interface PageTreeNode {
  name: string;
  type: "file" | "directory";
  path: string; // Relative to docs-directory
  link?: string; // Web URL (files only)
  sourcePath?: string; // Source .md file (files only)
  outputPath?: string; // Generated .html file (files only)
  docmachTags?: DocmachTagMetadata[]; // Files only
  children?: PageTreeNode[]; // Directories only
}

function extractDocmachTags(fileContent: string): DocmachTagMetadata[] {
  const tags: DocmachTagMetadata[] = [];

  // Extract wrapper tags
  const wrapperRegex = /<docmach\b([^>]*?)\s*([^/])>([\s\S]*?)<\/docmach>/g;
  let match;
  while ((match = wrapperRegex.exec(fileContent)) !== null) {
    const attrStr = match[1].endsWith('"') ? match[1] : match[1] + '"';
    const attrs = parseAttributes(attrStr);
    const tag: DocmachTagMetadata = {
      type: attrs["type"] || "unknown",
    };
    if (attrs["file"]) tag.file = attrs["file"];
    if (attrs["params"]) tag.params = parseParams(attrs["params"]);
    if (attrs["replacement"]) tag.replacement = attrs["replacement"];
    tags.push(tag);
  }

  // Extract self-closing tags
  const tagRegex = /<docmach([^>]+)\/?\>/g;
  while ((match = tagRegex.exec(fileContent)) !== null) {
    const attrs = parseAttributes(match[1]);
    const tag: DocmachTagMetadata = {
      type: attrs["type"] || "unknown",
    };
    if (attrs["file"]) tag.file = attrs["file"];
    if (attrs["params"]) tag.params = parseParams(attrs["params"]);
    tags.push(tag);
  }

  return tags;
}

export async function compileFile(filePath: string): Promise<string> {
  let fileContent = await readFile(normalizePath(filePath), "utf8");
  fileContent = md.render(fileContent);
  const replacements: {
    original: string;
    replacement: string;
  }[] = [];
  replacements.push(...(await processSelfClosingTags(fileContent, filePath)));
  replacements.push(...(await processWrapperTags(fileContent, filePath)));
  replacements.reverse().forEach(({ original, replacement }) => {
    fileContent = fileContent.replace(original, replacement);
  });
  return fileContent;
}

export async function compileFileWithMetadata(
  filePath: string
): Promise<{ content: string; tags: DocmachTagMetadata[] }> {
  const rawContent = await readFile(normalizePath(filePath), "utf8");
  const tags = extractDocmachTags(rawContent);
  const content = await compileFile(filePath);
  return { content, tags };
}
