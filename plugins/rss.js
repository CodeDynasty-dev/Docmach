/*
 * docmach:rss
 *
 * Generates an RSS 2.0 feed of the most recently updated pages.
 *
 * {
 *   "path": "docmach:rss",
 *   "options": { "title": "My blog", "output": "rss.xml", "limit": 50 }
 * }
 */
import { readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { cwd } from "node:process";

const h1Pattern = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
const titlePattern = /<title[^>]*>([\s\S]*?)<\/title>/i;
const entityPattern = /&(#39|amp|lt|gt|quot|apos|nbsp);/g;
const entities = {
  "#39": "'",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

// strip tags, then decode entities so text is escaped exactly once on output
function toText(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(entityPattern, (match, name) => entities[name] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function rss(options = {}) {
  const output = options.output ?? "rss.xml";
  const limit = options.limit ?? 50;
  return {
    name: "rss",
    hooks: {
      async postBuild({ config, pages }) {
        const baseUrl = (options["site-url"] ?? config["site-url"])?.replace(
          /\/$/,
          "",
        );
        if (!baseUrl) {
          console.warn('rss: no "site-url" configured, skipping feed.');
          return;
        }

        // newest pages first, based on the source file mtime
        const entries = [];
        for (const page of pages) {
          let updated = new Date();
          try {
            updated = (await stat(join(cwd(), page.sourcePath))).mtime;
          } catch (_e) {
            // file was removed during the build, keep the current date
          }
          entries.push({ page, updated });
        }
        entries.sort((a, b) => b.updated.getTime() - a.updated.getTime());

        const items = [];
        for (const { page, updated } of entries.slice(0, limit)) {
          let html = "";
          try {
            html = await readFile(join(cwd(), page.outputPath), "utf8");
          } catch (_e) {
            // page removed between the build and the feed, fall back to the link
          }
          const title = toText(html.match(h1Pattern)?.[1] ?? "") ||
            toText(html.match(titlePattern)?.[1] ?? "") || page.link;
          const url = `${baseUrl}${page.link}`;
          items.push(`    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <pubDate>${updated.toUTCString()}</pubDate>
    </item>`);
        }

        const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(options.title ?? "Docmach site")}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(options.description ?? "")}</description>
${items.join("\n")}
  </channel>
</rss>`;

        await writeFile(join(resolve(config["build-directory"]), output), feed);
        console.log(`rss: wrote ${output} (${items.length} items)`);
      },
    },
  };
}
