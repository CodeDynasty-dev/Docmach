import { createReadStream } from "fs";
import { existsSync } from "fs";
import { resolve } from "path";
import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import { readFile } from "fs/promises";

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

const functionCache = new Map<string, any>();
const fragmentCache = new Map<string, string>();
const mdCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

type Params = Record<string, string | number>;

type Attributes = {
  file?: string;
  params?: Params;
  type?: string;
};

function cacheMapLimit(cacheMap: Map<any, any>): void {
  if (cacheMap.size > MAX_CACHE_SIZE) {
    const firstKey = cacheMap.keys().next().value;
    cacheMap.delete(firstKey);
  }
}

async function parseParams(paramsStr: string): Promise<Params> {
  return Object.fromEntries(
    paramsStr.split(";").map((pair) => {
      const [key, value] = pair.split(":").map((str) => str.trim());
      return [key, isNaN(Number(value)) ? value : Number(value)];
    }),
  );
}

async function streamFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    const stream = createReadStream(filePath, { encoding: "utf8" });
    stream.on("data", (chunk: string) => (data += chunk));
    stream.on("end", () => resolve(data));
    stream.on("error", reject);
  });
}

function renderMarkdown(content: string): string {
  if (!mdCache.has(content)) {
    if (mdCache.size > 50) mdCache.clear();
    mdCache.set(content, md.render(content));
  }
  return mdCache.get(content) as string;
}

export async function compileFile(filePath: string): Promise<string> {
  let fileContent = await readFile(filePath, "utf8");
  fileContent = renderMarkdown(fileContent);
  const tagRegex = /<docmach([^>]+)\/?\>/g;
  const attrRegex = /(\w+)="([^"]+)"/g;

  const replacements: { original: string; replacement: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(fileContent)) !== null) {
    const tagFull = match[0];
    let attributes: Attributes = {};

    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(match[1])) !== null) {
      let key = attrMatch[1] as keyof Attributes;
      let value: any = attrMatch[2];

      if (key === "params") value = await parseParams(value);
      attributes[key] = value;
    }

    const { file, type, params } = attributes;
    if (!file || !type) continue;

    const resolvedPath = resolve(file);

    if (type === "function") {
      if (!existsSync(resolvedPath)) {
        console.error(`Docmach: Function file not found: ${resolvedPath}`);
        continue;
      }

      try {
        let module;
        if (functionCache.has(resolvedPath)) {
          module = functionCache.get(resolvedPath);
        } else {
          module = await import(resolvedPath);
          functionCache.set(resolvedPath, module);
        }
        cacheMapLimit(functionCache);

        if (typeof module.default !== "function") {
          console.error(
            `Docmach: No default function export in ${resolvedPath}`,
          );
          continue;
        }

        const result = await module.default(params || {});
        replacements.push({ original: tagFull, replacement: String(result) });
      } catch (err) {
        console.error(`Error executing function ${resolvedPath}:`, err);
      }
    }

    if (type === "fragment") {
      if (!existsSync(resolvedPath)) {
        console.error(`Docmach: Fragment file not found: ${resolvedPath}`);
        continue;
      }
      let fragmentContent: string;
      if (fragmentCache.has(resolvedPath)) {
        fragmentContent = fragmentCache.get(resolvedPath) as string;
      } else {
        fragmentContent = await streamFile(resolvedPath);
        fragmentCache.set(resolvedPath, fragmentContent);
      }
      cacheMapLimit(fragmentCache);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          fragmentContent = fragmentContent.replace(
            new RegExp(`{{\\s*${key}\\s*}}`, "g"),
            String(value),
          );
        });
      }
      replacements.push({ original: tagFull, replacement: fragmentContent });
    }
  }

  replacements.forEach(({ original, replacement }) => {
    fileContent = fileContent.replace(original, replacement);
  });

  return fileContent;
}
