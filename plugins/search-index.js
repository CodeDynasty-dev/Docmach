/*
 * docmach:search-index
 *
 * Writes a JSON index of every page (title, description, url) that a static
 * site can fetch and search client side.
 *
 * {
 *   "path": "docmach:search-index",
 *   "options": { "output": "search-index.json", "descriptionLength": 160 }
 * }
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { cwd } from "node:process";

const h1Pattern = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
const titlePattern = /<title[^>]*>([\s\S]*?)<\/title>/i;
const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/i;

function toText(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function searchIndex(options = {}) {
  const output = options.output ?? "search-index.json";
  const descriptionLength = options.descriptionLength ?? 160;
  return {
    name: "search-index",
    hooks: {
      async postBuild({ config, pages }) {
        const index = [];
        for (const page of pages) {
          const html = await readFile(join(cwd(), page.outputPath), "utf8");
          const title = toText(
            html.match(h1Pattern)?.[1] ??
              html.match(titlePattern)?.[1] ??
              page.link,
          );
          const description = toText(html.match(paragraphPattern)?.[1] ?? "")
            .slice(0, descriptionLength);
          index.push({
            title,
            description,
            url: page.link,
            source: page.sourcePath,
          });
        }
        const indexPath = join(resolve(config["build-directory"]), output);
        await writeFile(indexPath, JSON.stringify(index, null, 2));
        console.log(`search-index: wrote ${output} (${index.length} pages)`);
      },
    },
  };
}
